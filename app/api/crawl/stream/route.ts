import { NextRequest } from 'next/server';
import { AISpider } from '@/lib/ai-spider';
import { z } from 'zod';

const crawlSchema = z.object({
  url: z.string().url(),
  extractionType: z.enum(['content', 'structured', 'links', 'analysis']),
  structuredFields: z.array(z.string()).optional(),
  maxDepth: z.number().min(0).max(3).optional(),
});

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const config = crawlSchema.parse(body);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        encoder.encode(
          JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' })
        ),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const baseURL = process.env.ANTHROPIC_BASE_URL;

    const stream = new ReadableStream({
      async start(controller) {
        const spider = new AISpider(apiKey, baseURL);

        try {
          const results = await spider.crawlDeep(config, (result) => {
            // Send progress updates
            const data = `data: ${JSON.stringify(result)}\n\n`;
            controller.enqueue(encoder.encode(data));
          });

          // Send final completion message
          const data = `data: ${JSON.stringify({ done: true, results })}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        } catch (error) {
          const errorData = `data: ${JSON.stringify({ error: String(error) })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        encoder.encode(
          JSON.stringify({
            error: 'Invalid request data',
            details: error.issues,
          })
        ),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      encoder.encode(JSON.stringify({ error: String(error) })),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
