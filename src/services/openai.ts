import OpenAI from 'openai';

export async function generateYaml(scrapedData: any, apiKey: string) {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
Analyze the following scraped data and extract information to create a connector configuration with the following structure:

1. Connector Section:
   - Find and extract the base URL
   - Identify any authorization methods or requirements
   - Determine the HTTP methods used

2. Steps Section:
   - List all relative paths to reports/endpoints
   - For each path, specify the HTTP method
   - Include any required parameters

Format the output as follows:
connector:
  baseUrl: [base url]
  auth: [auth method]
  method: [http method]

steps:
  - path: [relative path]
    method: [http method]
  [additional steps...]

Scraped Data:
${JSON.stringify(scrapedData, null, 2)}

Only output the formatted content as shown above, nothing else.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
    temperature: 0.3,
  });

  return completion.choices[0].message.content;
}