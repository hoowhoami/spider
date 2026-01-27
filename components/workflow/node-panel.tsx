'use client';

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
  PlayCircle,
  StopCircle,
} from 'lucide-react';
import { NodeType } from '@/lib/workflow-types';
import { zh } from '@/lib/i18n';

interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'start',
    label: zh.nodeTypes.start,
    description: zh.nodeDescriptions.start,
    icon: <PlayCircle className="h-5 w-5" />,
    color: 'bg-emerald-500',
  },
  {
    type: 'end',
    label: zh.nodeTypes.end,
    description: zh.nodeDescriptions.end,
    icon: <StopCircle className="h-5 w-5" />,
    color: 'bg-red-500',
  },
  {
    type: 'input',
    label: zh.nodeTypes.input,
    description: zh.nodeDescriptions.input,
    icon: <Globe className="h-5 w-5" />,
    color: 'bg-blue-500',
  },
  {
    type: 'search-engine',
    label: zh.nodeTypes['search-engine'],
    description: zh.nodeDescriptions['search-engine'],
    icon: <Search className="h-5 w-5" />,
    color: 'bg-cyan-500',
  },
  {
    type: 'ai-extract',
    label: zh.nodeTypes['ai-extract'],
    description: zh.nodeDescriptions['ai-extract'],
    icon: <Brain className="h-5 w-5" />,
    color: 'bg-purple-500',
  },
  {
    type: 'ai-analyze',
    label: zh.nodeTypes['ai-analyze'],
    description: zh.nodeDescriptions['ai-analyze'],
    icon: <Brain className="h-5 w-5" />,
    color: 'bg-purple-600',
  },
  {
    type: 'ai-filter',
    label: zh.nodeTypes['ai-filter'],
    description: zh.nodeDescriptions['ai-filter'],
    icon: <Filter className="h-5 w-5" />,
    color: 'bg-orange-500',
  },
  {
    type: 'batch-crawl',
    label: zh.nodeTypes['batch-crawl'],
    description: zh.nodeDescriptions['batch-crawl'],
    icon: <LinkIcon className="h-5 w-5" />,
    color: 'bg-green-500',
  },
  {
    type: 'data-transform',
    label: zh.nodeTypes['data-transform'],
    description: zh.nodeDescriptions['data-transform'],
    icon: <Database className="h-5 w-5" />,
    color: 'bg-yellow-500',
  },
  {
    type: 'export',
    label: zh.nodeTypes.export,
    description: zh.nodeDescriptions.export,
    icon: <FileDown className="h-5 w-5" />,
    color: 'bg-pink-500',
  },
  {
    type: 'output',
    label: zh.nodeTypes.output,
    description: zh.nodeDescriptions.output,
    icon: <Play className="h-5 w-5" />,
    color: 'bg-gray-500',
  },
];

export function NodePanel() {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="text-lg">{zh.panels.nodes}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {nodeTemplates.map((template) => (
          <div
            key={template.type}
            draggable
            onDragStart={(e) => onDragStart(e, template.type)}
            className="cursor-move rounded-lg border bg-card p-3 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded p-2 text-white ${template.color}`}>
                {template.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{template.label}</h4>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
