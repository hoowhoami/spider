'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zh } from '@/lib/i18n';

interface ExecutionLog {
  type: 'node_start' | 'node_complete' | 'node_error' | 'complete';
  nodeId?: string;
  nodeName?: string;
  result?: any;
  error?: string;
  timestamp: string;
  results?: any[];
  nodesExecuted?: number;
}

interface ExecutionLogsPanelProps {
  logs: ExecutionLog[];
  onClose: () => void;
}

export function ExecutionLogsPanel({ logs, onClose }: ExecutionLogsPanelProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{zh.logsPanel.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {zh.logsPanel.noLogs}
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 text-sm ${
                    log.type === 'node_start'
                      ? 'border-blue-200 bg-blue-50'
                      : log.type === 'node_complete'
                        ? 'border-green-200 bg-green-50'
                        : log.type === 'node_error'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-1 items-start gap-2">
                      {log.type === 'node_start' && (
                        <Loader2 className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin text-blue-600" />
                      )}
                      {log.type === 'node_complete' && (
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      )}
                      {log.type === 'node_error' && (
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">
                          {log.nodeName || zh.common.system}
                        </div>
                        <div className="mt-1 text-xs">
                          {log.type === 'node_start' &&
                            zh.logsPanel.startExecution}
                          {log.type === 'node_complete' &&
                            zh.logsPanel.executionComplete}
                          {log.type === 'node_error' &&
                            `${zh.logsPanel.executionError}: ${log.error}`}
                          {log.type === 'complete' &&
                            `${zh.logsPanel.workflowComplete} (${log.nodesExecuted} ${zh.common.nodesCount})`}
                        </div>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
