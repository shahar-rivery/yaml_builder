export interface ScrapingResult {
  url: string;
  data: any;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export interface ApiKeys {
  apifyApiKey: string;
  openaiApiKey: string;
}