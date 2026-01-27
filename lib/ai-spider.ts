import { query } from '@anthropic-ai/claude-agent-sdk';
import puppeteer, { Browser, Page } from 'puppeteer';

export interface CrawlerConfig {
  url: string;
  maxDepth?: number;
  extractionType: 'content' | 'structured' | 'links' | 'analysis';
  structuredFields?: string[];
  customPrompt?: string;
  useBrowser?: boolean; // Use headless browser for dynamic pages
  waitForSelector?: string; // Optional: wait for specific element
  timeout?: number; // Page load timeout in ms (default: 30000)
  onLog?: (
    message: string,
    level?: 'info' | 'success' | 'error' | 'warning'
  ) => void; // Real-time logging callback
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
  private browser: Browser | null = null;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async crawl(config: CrawlerConfig): Promise<CrawlResult> {
    const log = (
      message: string,
      level: 'info' | 'success' | 'error' | 'warning' = 'info'
    ) => {
      if (config.onLog) {
        config.onLog(message, level);
      }
    };

    log(`开始抓取: ${config.url}`, 'info');

    // Fetch the webpage content
    log(`正在获取网页内容...`, 'info');
    const htmlContent = await this.fetchPage(config);
    log(
      `✓ 网页内容获取成功 (${(htmlContent.length / 1024).toFixed(2)} KB)`,
      'success'
    );

    // Use Claude Agent SDK to extract information based on the extraction type
    log(`正在使用 AI 提取信息 (类型: ${config.extractionType})...`, 'info');
    const result = await this.extractWithAI(htmlContent, config);
    log(`✓ AI 提取完成`, 'success');

    return {
      url: config.url,
      ...result,
      metadata: {
        timestamp: new Date().toISOString(),
        depth: 0,
      },
    };
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async fetchPage(config: CrawlerConfig): Promise<string> {
    const log = (
      message: string,
      level: 'info' | 'success' | 'error' | 'warning' = 'info'
    ) => {
      if (config.onLog) {
        config.onLog(message, level);
      }
    };

    if (config.useBrowser) {
      log('使用浏览器模式抓取...', 'info');
      return this.fetchPageWithBrowser(config);
    } else {
      log('使用 HTTP 请求抓取...', 'info');
      return this.fetchPageWithFetch(config.url, config.onLog);
    }
  }

  private async fetchPageWithFetch(
    url: string,
    onLog?: (
      message: string,
      level?: 'info' | 'success' | 'error' | 'warning'
    ) => void
  ): Promise<string> {
    const log = (
      message: string,
      level: 'info' | 'success' | 'error' | 'warning' = 'info'
    ) => {
      if (onLog) {
        onLog(message, level);
      }
    };

    try {
      log(`发送 HTTP 请求到 ${url}`, 'info');
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AISpider/1.0; +https://example.com/bot)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      log(`✓ HTTP 响应成功 (状态码: ${response.status})`, 'success');
      return await response.text();
    } catch (error) {
      log(`✗ 请求失败: ${error}`, 'error');
      throw new Error(`Failed to fetch page: ${error}`);
    }
  }

  private async fetchPageWithBrowser(config: CrawlerConfig): Promise<string> {
    const log = (
      message: string,
      level: 'info' | 'success' | 'error' | 'warning' = 'info'
    ) => {
      if (config.onLog) {
        config.onLog(message, level);
      }
    };

    log('启动浏览器...', 'info');
    const browser = await this.getBrowser();
    log('✓ 浏览器已启动', 'success');

    const page = await browser.newPage();
    log('创建新页面...', 'info');

    try {
      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to the page
      const timeout = config.timeout || 30000;
      log(`导航到 ${config.url} (超时: ${timeout}ms)`, 'info');
      await page.goto(config.url, {
        waitUntil: 'networkidle2',
        timeout,
      });
      log('✓ 页面加载完成', 'success');

      // Wait for specific selector if provided
      if (config.waitForSelector) {
        log(`等待选择器: ${config.waitForSelector}`, 'info');
        await page.waitForSelector(config.waitForSelector, { timeout: 10000 });
        log('✓ 选择器已出现', 'success');
      }

      // Get the rendered HTML
      log('提取页面 HTML...', 'info');
      const html = await page.content();
      log(`✓ HTML 提取完成 (${(html.length / 1024).toFixed(2)} KB)`, 'success');

      return html;
    } catch (error) {
      log(`✗ 浏览器抓取失败: ${error}`, 'error');
      throw new Error(`Failed to fetch page with browser: ${error}`);
    } finally {
      await page.close();
      log('页面已关闭', 'info');
    }
  }

  private async extractWithAI(
    htmlContent: string,
    config: CrawlerConfig
  ): Promise<Partial<CrawlResult>> {
    const log = (
      message: string,
      level: 'info' | 'success' | 'error' | 'warning' = 'info'
    ) => {
      if (config.onLog) {
        config.onLog(message, level);
      }
    };

    const prompt = this.buildPrompt(htmlContent, config);

    log('构建 AI 提示词...', 'info');
    log(`提示词长度: ${prompt.length} 字符`, 'info');
    log('发送请求到 Claude Agent SDK...', 'info');

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

    // Iterate through the messages from the agent
    for await (const message of agentQuery) {
      log(`Agent 消息类型: ${message.type}`, 'info');

      if (message.type === 'result') {
        if (message.subtype === 'success') {
          responseText = message.result;
          log(`✓ Claude Agent SDK 响应接收完成`, 'success');
          log(`响应长度: ${responseText.length} 字符`, 'info');
        } else {
          log(`✗ Agent 查询失败: ${message.subtype}`, 'error');
          throw new Error(`Agent query failed: ${message.subtype}`);
        }
      } else if (message.type === 'assistant') {
        // Collect assistant messages
        // @ts-expect-error - SDK assistant message type
        const content = message.content;
        if (typeof content === 'string') {
          responseText += content;
          log(`接收到 AI 响应片段 (${content.length} 字符)`, 'info');
        } else if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text') {
              responseText += block.text;
              log(`接收到 AI 文本块 (${block.text.length} 字符)`, 'info');
            }
          }
        }
      }
    }

    if (!responseText) {
      log('✗ Claude Agent SDK 未返回响应', 'error');
      throw new Error('No response from Claude Agent SDK');
    }

    log('解析 AI 响应...', 'info');
    const result = this.parseResponse(responseText, config.extractionType);
    log('✓ 响应解析完成', 'success');

    return result;
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
      // Try to extract JSON from markdown code blocks first
      const markdownJsonMatch = responseText.match(
        /```json\s*([\s\S]*?)\s*```/
      );
      let jsonText: string | null = null;

      if (markdownJsonMatch) {
        jsonText = markdownJsonMatch[1];
      } else {
        // Try to extract JSON without markdown
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      if (jsonText) {
        const parsed = JSON.parse(jsonText);

        switch (extractionType) {
          case 'content':
            return {
              title: parsed.title,
              content: parsed.content || JSON.stringify(parsed, null, 2),
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
              analysis: parsed.analysis || JSON.stringify(parsed, null, 2),
            };
          default:
            return { content: responseText };
        }
      }

      // If no JSON found, return the full response as content
      return { content: responseText };
    } catch (error) {
      console.error('Failed to parse response:', error);
      // Return the full response as content if parsing fails
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
