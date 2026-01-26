'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2,
  Globe,
  FileText,
  Link as LinkIcon,
  Brain,
} from 'lucide-react';

interface CrawlResult {
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

export function CrawlerInterface() {
  const [url, setUrl] = useState('');
  const [extractionType, setExtractionType] = useState<
    'content' | 'structured' | 'links' | 'analysis'
  >('content');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [streamResults, setStreamResults] = useState<CrawlResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleCrawl = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          extractionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Crawl error:', data);
        throw new Error(data.error || data.message || 'Failed to crawl');
      }

      console.log('Crawl result:', data);
      setResult(data);
      setProgress(100);

      toast({
        title: 'Success',
        description: 'Page crawled successfully',
      });
    } catch (error) {
      console.error('Crawl exception:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamCrawl = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStreamResults([]);
    setProgress(0);

    try {
      const response = await fetch('/api/crawl/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          extractionType,
          maxDepth: 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start crawl');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              setProgress(100);
              toast({
                title: 'Complete',
                description: `Crawled ${data.results.length} pages`,
              });
            } else if (data.error) {
              throw new Error(data.error);
            } else {
              setStreamResults((prev) => [...prev, data]);
              setProgress((prev) => Math.min(prev + 10, 90));
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">AI Spider</h1>
        <p className="text-muted-foreground">
          Intelligent web crawler powered by Claude Agent SDK
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Crawler Configuration</CardTitle>
          <CardDescription>
            Enter a URL and select the extraction type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Extraction Type</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Button
                variant={extractionType === 'content' ? 'default' : 'outline'}
                onClick={() => setExtractionType('content')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Content
              </Button>
              <Button
                variant={
                  extractionType === 'structured' ? 'default' : 'outline'
                }
                onClick={() => setExtractionType('structured')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Structured
              </Button>
              <Button
                variant={extractionType === 'links' ? 'default' : 'outline'}
                onClick={() => setExtractionType('links')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Links
              </Button>
              <Button
                variant={extractionType === 'analysis' ? 'default' : 'outline'}
                onClick={() => setExtractionType('analysis')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Analysis
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCrawl}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crawling...
                </>
              ) : (
                'Crawl Now'
              )}
            </Button>
            <Button
              onClick={handleStreamCrawl}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deep Crawling...
                </>
              ) : (
                'Deep Crawl'
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Label>Progress</Label>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Crawl Result</CardTitle>
            <CardDescription>{result.url}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="space-y-4">
                {result.title && (
                  <div>
                    <h3 className="mb-2 font-semibold">Title</h3>
                    <p>{result.title}</p>
                  </div>
                )}
                {result.content && (
                  <div>
                    <h3 className="mb-2 font-semibold">Content</h3>
                    <p className="whitespace-pre-wrap">{result.content}</p>
                  </div>
                )}
                {result.analysis && (
                  <div>
                    <h3 className="mb-2 font-semibold">Analysis</h3>
                    <p className="whitespace-pre-wrap">{result.analysis}</p>
                  </div>
                )}
                {result.links && (
                  <div>
                    <h3 className="mb-2 font-semibold">Links</h3>
                    <ul className="list-inside list-disc space-y-1">
                      {result.links.map((link, i) => (
                        <li key={i}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.structuredData && (
                  <div>
                    <h3 className="mb-2 font-semibold">Structured Data</h3>
                    <pre className="overflow-x-auto rounded-md bg-muted p-4">
                      {JSON.stringify(result.structuredData, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="raw">
                <pre className="overflow-x-auto rounded-md bg-muted p-4">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {streamResults.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Deep Crawl Results</h2>
          {streamResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {result.title || result.url}
                </CardTitle>
                <CardDescription>
                  Depth: {result.metadata?.depth} | {result.url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.content && (
                  <p className="line-clamp-3 text-sm">{result.content}</p>
                )}
                {result.analysis && (
                  <p className="line-clamp-3 text-sm">{result.analysis}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
