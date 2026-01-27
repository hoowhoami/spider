'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import { zh } from '@/lib/i18n';

interface ExecutionResult {
  success: boolean;
  results: any[];
  nodesExecuted: number;
  error?: string;
}

interface ResultsPanelProps {
  result: ExecutionResult | null;
  onClose: () => void;
}

export function ResultsPanel({ result, onClose }: ResultsPanelProps) {
  if (!result) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-4">
        <p className="text-center text-sm text-muted-foreground">
          {zh.messages.executeToSeeResults}
        </p>
      </div>
    );
  }

  const downloadResults = () => {
    const dataStr = JSON.stringify(result.results, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `workflow_results_${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-end border-b bg-background px-6 py-2">
        <Button variant="outline" size="sm" onClick={downloadResults}>
          <Download className="mr-2 h-4 w-4" />
          下载结果
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {result.error ? (
          <div className="rounded-lg border border-red-500 bg-red-50 p-4">
            <h3 className="font-semibold text-red-900">{zh.status.error}</h3>
            <p className="text-sm text-red-700">{result.error}</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{zh.common.status}</span>
                <span className="text-sm text-green-600">
                  ✓ {zh.status.success}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {zh.stats.nodesExecuted}
                </span>
                <span className="text-sm">{result.nodesExecuted}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {zh.stats.resultsCount}
                </span>
                <span className="text-sm">{result.results?.length || 0}</span>
              </div>
            </div>

            <Tabs defaultValue="formatted">
              <TabsList className="w-full">
                <TabsTrigger value="formatted" className="flex-1">
                  格式化
                </TabsTrigger>
                <TabsTrigger value="raw" className="flex-1">
                  原始 JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="formatted" className="space-y-2">
                {result.results && result.results.length > 0 ? (
                  result.results.map((item, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          结果 {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {item.url && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              URL:
                            </span>
                            <p className="break-all text-sm">{item.url}</p>
                          </div>
                        )}
                        {item.title && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              标题:
                            </span>
                            <p className="text-sm">{item.title}</p>
                          </div>
                        )}
                        {item.content && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              内容:
                            </span>
                            <p className="line-clamp-3 text-sm">
                              {item.content}
                            </p>
                          </div>
                        )}
                        {item.data && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              数据:
                            </span>
                            <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                              {JSON.stringify(item.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {zh.messages.noResults}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="raw">
                <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
                  {JSON.stringify(result.results, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
