'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zh } from '@/lib/i18n';
import { useState } from 'react';

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

interface NodeExecution {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error';
  startTime: string;
  endTime: string;
  duration: number;
  result?: any;
  error?: string;
}

export function ExecutionLogsPanel({ logs, onClose }: ExecutionLogsPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 合并开始和完成日志，计算执行时间
  const nodeExecutions: NodeExecution[] = [];
  const nodeStarts = new Map<string, ExecutionLog>();

  logs.forEach((log) => {
    if (log.type === 'node_start' && log.nodeId) {
      nodeStarts.set(log.nodeId, log);
    } else if (
      (log.type === 'node_complete' || log.type === 'node_error') &&
      log.nodeId
    ) {
      const startLog = nodeStarts.get(log.nodeId);
      if (startLog) {
        const startTime = new Date(startLog.timestamp);
        const endTime = new Date(log.timestamp);
        const duration = endTime.getTime() - startTime.getTime();

        nodeExecutions.push({
          nodeId: log.nodeId,
          nodeName: log.nodeName || '',
          status: log.type === 'node_complete' ? 'success' : 'error',
          startTime: startLog.timestamp,
          endTime: log.timestamp,
          duration,
          result: log.result,
          error: log.error,
        });
      }
    }
  });

  const completionLog = logs.find((log) => log.type === 'complete');

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatResultPreview = (result: any): string => {
    if (!result) return '无数据';

    if (result.urls && Array.isArray(result.urls)) {
      return `${result.urls.length} 个URL`;
    }
    if (result.results && Array.isArray(result.results)) {
      return `${result.results.length} 条结果`;
    }
    if (result.data) {
      if (Array.isArray(result.data)) {
        return `${result.data.length} 条数据`;
      }
      return '1 条数据';
    }

    return JSON.stringify(result).substring(0, 50) + '...';
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{zh.logsPanel.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {nodeExecutions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {zh.logsPanel.noLogs}
              </p>
            ) : (
              <>
                {nodeExecutions.map((execution) => (
                  <div
                    key={execution.nodeId}
                    className={`rounded-lg border transition-all ${
                      execution.status === 'success'
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div
                      className="flex cursor-pointer items-start justify-between gap-2 p-3"
                      onClick={() => toggleExpand(execution.nodeId)}
                    >
                      <div className="flex flex-1 items-start gap-2">
                        {execution.status === 'success' ? (
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {execution.nodeName}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDuration(execution.duration)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {execution.status === 'success' ? (
                              <span>
                                ✓ {formatResultPreview(execution.result)}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ {execution.error}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatTime(execution.endTime)}
                        </span>
                        {expandedNodes.has(execution.nodeId) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {expandedNodes.has(execution.nodeId) &&
                      execution.result && (
                        <div className="border-t bg-white/50 p-3">
                          <div className="text-xs">
                            <div className="mb-2 font-medium text-muted-foreground">
                              执行详情
                            </div>
                            <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                              {JSON.stringify(execution.result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                  </div>
                ))}

                {completionLog && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {zh.logsPanel.workflowComplete}
                      </span>
                      <span className="text-muted-foreground">
                        ({completionLog.nodesExecuted} 个节点)
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatTime(completionLog.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
