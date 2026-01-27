import { query } from '@anthropic-ai/claude-agent-sdk';

export interface CrawlerConfig {
  url: string;
  maxDepth?: number;
  extractionType: 'content' | 'structured' | 'links' | 'analysis';
  structuredFields?: string[];
  customPrompt?: string;
}

export interface CrawlResult {
  url: string;
  title?: string;
  content?: string;
  structuredData?: Record<string, unknown>;
  links?: string[];
  analysis?: string;
  metadata?: {
    timestamp: string;
    depth: number;
  };
}

export class AISpider {
  private apiKey: string;
  private baseURL?: string;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async crawl(config: CrawlerConfig): Promise<CrawlResult> {
    // Fetch the webpage content
    const htmlContent = await this.fetchPage(config.url);

    // Use Claude Agent SDK to extract information based on the extraction type
    const result = await this.extractWithAI(htmlContent, config);

    return {
      url: config.url,
      ...result,
      metadata: {
        timestamp: new Date().toISOString(),
        depth: 0,
      },
    };
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AISpider/1.0; +https://example.com/bot)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error}`);
    }
  }

  private async extractWithAI(
    htmlContent: string,
    config: CrawlerConfig
  ): Promise<Partial<CrawlResult>> {
    const prompt = this.buildPrompt(htmlContent, config);

    console.log('Sending request to Claude Agent SDK...');

    // Use the Agent SDK query function
    const agentQuery = query({
      prompt,
      options: {
        model: 'claude-sonnet-4-5-20250929',
        maxTurns: 1,
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: this.apiKey,
          ...(this.baseURL && { ANTHROPIC_BASE_URL: this.baseURL }),
        },
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        persistSession: false,
      },
    });

    let responseText = '';
    let hasResult = false;

    // Iterate through the messages from the agent
    for await (const message of agentQuery) {
      console.log('Agent message:', message.type, message.subtype);

      if (message.type === 'result') {
        hasResult = true;
        if (message.subtype === 'success') {
          responseText = message.result;
          console.log('Claude Agent SDK response received');
          console.log('Response text length:', responseText.length);
        } else {
          // Handle error result types
          throw new Error(`Agent query failed: ${message.subtype}`);
        }
      } else if (message.type === 'text') {
        // 收集文本消息
        responseText += message.text || '';
      }
    }

    if (!hasResult && responseText) {
      console.log('No result message, using collected text');
    }

    if (!responseText) {
      throw new Error('No response from Claude Agent SDK');
    }

    return this.parseResponse(responseText, config.extractionType);
  }

  private buildPrompt(htmlContent: string, config: CrawlerConfig): string {
    const truncatedHtml = htmlContent.slice(0, 50000); // Limit HTML size

    // 如果有自定义提示词，优先使用
    if (config.customPrompt) {
      return `${config.customPrompt}

IMPORTANT: Extract information ONLY from the HTML content provided below. Do NOT use any tools or try to fetch additional resources. Work with what is given.

HTML:
${truncatedHtml}

Please provide the result in JSON format if applicable.`;
    }

    switch (config.extractionType) {
      case 'content':
        return `Extract the main content from this webpage. Focus on the title, main text, and key information. Ignore navigation, ads, and boilerplate.

IMPORTANT: Extract information ONLY from the HTML content provided below. Do NOT use any tools.

HTML:
${truncatedHtml}

Please provide the result in JSON format:
{
  "title": "page title",
  "content": "main content text"
}`;

      case 'structured':
        return `Extract structured data from this webpage. Extract the following fields: ${config.structuredFields?.join(', ')}.

IMPORTANT: Extract information ONLY from the HTML content provided below. Do NOT use any tools.

HTML:
${truncatedHtml}

Please provide the result in JSON format with the requested fields.`;

      case 'links':
        return `Analyze this webpage and extract all important links. Categorize them and identify which ones are most relevant for further crawling.

IMPORTANT: Extract information ONLY from the HTML content provided below. Do NOT use any tools.

HTML:
${truncatedHtml}

Please provide the result in JSON format:
{
  "links": ["url1", "url2", ...],
  "analysis": "brief analysis of the links"
}`;

      case 'analysis':
        return `Analyze this webpage and provide a comprehensive summary. Include:
- Main topic and purpose
- Key information and insights
- Content quality and credibility
- Recommendations

HTML:
${truncatedHtml}

Please provide the result in JSON format:
{
  "title": "page title",
  "analysis": "comprehensive analysis"
}`;

      default:
        return `Extract the main content from this webpage.

HTML:
${truncatedHtml}`;
    }
  }

  private parseResponse(
    responseText: string,
    extractionType: string
  ): Partial<CrawlResult> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        switch (extractionType) {
          case 'content':
            return {
              title: parsed.title,
              content: parsed.content,
            };
          case 'structured':
            return {
              structuredData: parsed,
            };
          case 'links':
            return {
              links: parsed.links,
              analysis: parsed.analysis,
            };
          case 'analysis':
            return {
              title: parsed.title,
              analysis: parsed.analysis,
            };
          default:
            return { content: responseText };
        }
      }

      return { content: responseText };
    } catch {
      return { content: responseText };
    }
  }

  async crawlDeep(
    config: CrawlerConfig,
    onProgress?: (result: CrawlResult) => void
  ): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const visited = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [
      { url: config.url, depth: 0 },
    ];
    const maxDepth = config.maxDepth || 1;

    while (queue.length > 0) {
      const { url, depth } = queue.shift()!;

      if (visited.has(url) || depth > maxDepth) {
        continue;
      }

      visited.add(url);

      try {
        const result = await this.crawl({ ...config, url });
        result.metadata!.depth = depth;
        results.push(result);

        if (onProgress) {
          onProgress(result);
        }

        // If we're doing link discovery and haven't reached max depth, add links to queue
        if (
          result.links &&
          depth < maxDepth &&
          config.extractionType === 'links'
        ) {
          for (const link of result.links.slice(0, 5)) {
            // Limit to 5 links per page
            if (!visited.has(link)) {
              queue.push({ url: link, depth: depth + 1 });
            }
          }
        }
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }
    }

    return results;
  }
}
