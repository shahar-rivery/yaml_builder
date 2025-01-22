import React, { useState } from 'react';
import { Bot, Link, Loader2, Upload } from 'lucide-react';
import { scrapeUrl } from './services/apify';
import { generateYaml } from './services/openai';
import type { ScrapingResult, ApiKeys } from './types';
import { YamlForm } from './components/YamlForm'

function App() {
  const [url, setUrl] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    apifyApiKey: '',
    openaiApiKey: '',
  });
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult[]>([]);
  const [generatedYaml, setGeneratedYaml] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async () => {
    if (!url || !apiKeys.apifyApiKey) return;

    setIsLoading(true);
    try {
      const newResult: ScrapingResult = {
        url,
        data: null,
        status: 'pending'
      };
      setScrapingResults(prev => [...prev, newResult]);

      const data = await scrapeUrl(url, apiKeys.apifyApiKey);
      
      setScrapingResults(prev => 
        prev.map(result => 
          result.url === url 
            ? { ...result, data, status: 'success' }
            : result
        )
      );

      if (apiKeys.openaiApiKey) {
        const yaml = await generateYaml(data, apiKeys.openaiApiKey);
        setGeneratedYaml(yaml || '');
      }
    } catch (error) {
      setScrapingResults(prev => 
        prev.map(result => 
          result.url === url 
            ? { ...result, status: 'error', error: (error as Error).message }
            : result
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto">
        <YamlForm />
      </div>
    </div>
  );
}

export default App;