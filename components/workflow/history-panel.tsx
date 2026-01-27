'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { zh } from '@/lib/i18n';

interface HistoryPanelProps {
  onClose: () => void;
  onViewResults: (results: any) => void;
}

export function HistoryPanel({ onClose, onViewResults }: HistoryPanelProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(zh.errors.loadHistoryFailed, error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(zh.historyPanel.confirmDelete)) return;

    try {
      await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(zh.errors.deleteHistoryFailed, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return zh.status.completed;
      case 'failed':
        return zh.status.failed;
      case 'running':
        return zh.status.running;
      default:
        return zh.status.pending;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">{zh.common.loading}</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {zh.historyPanel.noHistory}
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="truncate font-medium">
                        {item.workflow_name}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        {zh.common.status}: {getStatusText(item.status)}
                      </div>
                      <div>
                        {zh.common.startTime}:{' '}
                        {new Date(item.started_at).toLocaleString('zh-CN')}
                      </div>
                      {item.completed_at && (
                        <div>
                          {zh.common.endTime}:{' '}
                          {new Date(item.completed_at).toLocaleString('zh-CN')}
                        </div>
                      )}
                      <div>
                        {zh.common.executedNodes}: {item.nodes_executed}
                      </div>
                      {item.error && (
                        <div className="text-red-600">
                          {zh.common.error}: {item.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {item.results && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // 转换数据格式以匹配 ResultsPanel 期望的格式
                          const formattedResults = {
                            success: item.status === 'completed',
                            results: item.results || [],
                            nodesExecuted: item.nodes_executed || 0,
                            error: item.error,
                          };
                          onViewResults(formattedResults);
                        }}
                        title={zh.common.viewResults}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      title={zh.common.delete}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
