'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Globe,
  Brain,
  Filter,
  Link as LinkIcon,
  Search,
  FileDown,
  Play,
  Database,
} from 'lucide-react';
import { NodeType, WorkflowNodeData } from '@/lib/workflow-types';

const nodeIcons: Record<NodeType, React.ReactNode> = {
  input: <Globe className="h-4 w-4" />,
  'ai-extract': <Brain className="h-4 w-4" />,
  'ai-analyze': <Brain className="h-4 w-4" />,
  'ai-filter': <Filter className="h-4 w-4" />,
  'batch-crawl': <LinkIcon className="h-4 w-4" />,
  'search-engine': <Search className="h-4 w-4" />,
  'data-transform': <Database className="h-4 w-4" />,
  export: <FileDown className="h-4 w-4" />,
  output: <Play className="h-4 w-4" />,
};

const nodeColors: Record<NodeType, string> = {
  input: 'bg-blue-500',
  'ai-extract': 'bg-purple-500',
  'ai-analyze': 'bg-purple-600',
  'ai-filter': 'bg-orange-500',
  'batch-crawl': 'bg-green-500',
  'search-engine': 'bg-cyan-500',
  'data-transform': 'bg-yellow-500',
  export: 'bg-pink-500',
  output: 'bg-gray-500',
};

interface CustomNodeProps {
  data: WorkflowNodeData & {
    nodeType: NodeType;
    isExecuting?: boolean;
    isCompleted?: boolean;
    isError?: boolean;
    [key: string]: unknown;
  };
  selected?: boolean;
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const nodeType = data.nodeType;
  const icon = nodeIcons[nodeType];
  const colorClass = nodeColors[nodeType];

  return (
    <Card
      className={`min-w-[200px] transition-all ${
        selected ? 'ring-2 ring-primary' : ''
      } ${data.isExecuting ? 'animate-pulse shadow-lg ring-2 ring-blue-500' : ''} ${
        data.isCompleted ? 'ring-2 ring-green-500' : ''
      } ${data.isError ? 'border-red-500 ring-2 ring-red-500' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div
            className={`rounded p-1 text-white ${colorClass} ${data.isExecuting ? 'animate-bounce' : ''}`}
          >
            {icon}
          </div>
          <span className="truncate">{data.label}</span>
          {data.isExecuting && (
            <span className="ml-auto text-xs font-normal text-blue-600">
              执行中...
            </span>
          )}
          {data.isCompleted && (
            <span className="ml-auto text-xs font-normal text-green-600">
              ✓
            </span>
          )}
          {data.isError && (
            <span className="ml-auto text-xs font-normal text-red-600">✗</span>
          )}
        </CardTitle>
      </CardHeader>
      {data.description && (
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </CardContent>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400"
      />
    </Card>
  );
});

CustomNode.displayName = 'CustomNode';
