import { NextRequest, NextResponse } from 'next/server';
import { AISpider } from '@/lib/ai-spider';
import { z } from 'zod';

const crawlSchema = z.object({
  url: z.string().url(),
  extractionType: z.enum(['content', 'structured', 'links', 'analysis']),
  structuredFields: z.array(z.string()).optional(),
  maxDepth: z.number().min(0).max(3).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = crawlSchema.parse(body);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const baseURL = process.env.ANTHROPIC_BASE_URL;
    const spider = new AISpider(apiKey, baseURL);
    const result = await spider.crawl(config);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to crawl', message: String(error) },
      { status: 500 }
    );
  }
}
