'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { zh } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

interface ExecutionLog {
  type: 'node_start' | 'node_complete' | 'node_error' | 'complete' | 'log';
  nodeId?: string;
  nodeName?: string;
  result?: any;
  error?: string;
  timestamp: string;
  results?: any[];
  nodesExecuted?: number;
  message?: string;
  level?: 'info' | 'success' | 'error' | 'warning';
}

interface ExecutionLogsPanelProps {
  logs: ExecutionLog[];
  onClose: () => void;
}

export function ExecutionLogsPanel({ logs, onClose }: ExecutionLogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getLogColor = (level?: string) => {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
      default:
        return 'text-gray-300';
    }
  };

  const getLogPrefix = (level?: string) => {
    switch (level) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return '→';
    }
  };

  const renderLog = (log: ExecutionLog, index: number) => {
    const time = formatTime(log.timestamp);

    // 处理不同类型的日志
    if (log.type === 'log' && log.message) {
      // 实时日志消息
      return (
        <div key={index} className="flex gap-2 font-mono text-sm">
          <span className="text-gray-500">[{time}]</span>
          <span className={getLogColor(log.level)}>
            {getLogPrefix(log.level)} {log.message}
          </span>
        </div>
      );
    } else if (log.type === 'node_start') {
      // 节点开始
      return (
        <div key={index} className="flex gap-2 font-mono text-sm">
          <span className="text-gray-500">[{time}]</span>
          <span className="text-blue-400">▶ 开始执行节点: {log.nodeName}</span>
        </div>
      );
    } else if (log.type === 'node_complete') {
      // 节点完成
      return (
        <div key={index} className="flex gap-2 font-mono text-sm">
          <span className="text-gray-500">[{time}]</span>
          <span className="text-green-400">✓ 节点执行完成: {log.nodeName}</span>
        </div>
      );
    } else if (log.type === 'node_error') {
      // 节点错误
      return (
        <div key={index} className="flex flex-col gap-1 font-mono text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500">[{time}]</span>
            <span className="text-red-400">✗ 节点执行失败: {log.nodeName}</span>
          </div>
          {log.error && (
            <div className="ml-20 text-red-300">错误: {log.error}</div>
          )}
        </div>
      );
    } else if (log.type === 'complete') {
      // 工作流完成
      return (
        <div key={index} className="flex gap-2 font-mono text-sm">
          <span className="text-gray-500">[{time}]</span>
          <span className="font-bold text-green-400">
            ✓ 工作流执行完成 ({log.nodesExecuted} 个节点)
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-full flex-col bg-gray-900">
      <ScrollArea className="h-full" ref={scrollRef}>
        <div className="space-y-1 bg-gray-900 p-4">
          {logs.length === 0 ? (
            <p className="font-mono text-sm text-gray-500">
              {zh.logsPanel.noLogs}
            </p>
          ) : (
            logs.map((log, index) => renderLog(log, index))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
