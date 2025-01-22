export async function scrapeUrl(url: string, apiKey: string) {
  try {
    // Start the scraping run
    const runResponse = await fetch('https://api.apify.com/v2/acts/apify~web-scraper/runs?token=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [{ url }],
        pageFunction: `async function pageFunction(context) {
          const { request, log, $ } = context;
          const title = $('title').text();
          const h1 = $('h1').text();
          const metaDescription = $('meta[name="description"]').attr('content');
          
          // Extract all text content
          const bodyText = $('body').text();
          
          // Extract all links
          const links = [];
          $('a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text();
            if (href) links.push({ href: href.trim(), text: text.trim() });
          });
          
          // Extract structured data if available
          let structuredData = [];
          $('script[type="application/ld+json"]').each((i, el) => {
            try {
              const data = JSON.parse($(el).html());
              structuredData.push(data);
            } catch (e) {
              log.error('Failed to parse structured data', e);
            }
          });
          
          return {
            url: request.url,
            title,
            h1,
            metaDescription,
            bodyText,
            links,
            structuredData
          };
        }`,
        proxyConfiguration: { useApifyProxy: true },
        waitUntil: ['networkidle2'],
        timeoutSecs: 300, // 5 minutes timeout
        maxRequestRetries: 3,
        maxConcurrency: 1
      }),
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error?.message || 'Failed to start scraping');
      } catch (e) {
        throw new Error(`Failed to start scraping: ${errorText}`);
      }
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    // Function to check run status
    const checkRunStatus = async (): Promise<string> => {
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }
      
      const statusData = await statusResponse.json();
      return statusData.data.status;
    };

    // Poll the run status with exponential backoff
    const maxAttempts = 60; // 60 attempts with exponential backoff
    let attempts = 0;
    let delay = 1000; // Start with 1 second delay
    
    while (attempts < maxAttempts) {
      const status = await checkRunStatus();
      
      if (status === 'SUCCEEDED') {
        break;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Scraping failed with status: ${status}`);
      }
      
      // Exponential backoff with max delay of 10 seconds
      delay = Math.min(delay * 1.5, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Scraping timed out after maximum attempts');
    }

    // Fetch the results from the dataset with retry logic
    const fetchDatasetWithRetry = async (retries = 3): Promise<any[]> => {
      try {
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`,
          { timeout: 30000 } // 30 seconds timeout for dataset fetch
        );
        
        if (!datasetResponse.ok) {
          throw new Error('Failed to fetch scraping results');
        }

        const data = await datasetResponse.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from scraping task');
        }

        return data;
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchDatasetWithRetry(retries - 1);
        }
        throw error;
      }
    };

    return await fetchDatasetWithRetry();
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during scraping');
  }
}