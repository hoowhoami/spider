'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeConfigPanel } from './node-config-panel';
import { ResultsPanel } from './results-panel';
import { HistoryPanel } from './history-panel';
import { ExecutionLogsPanel } from './execution-logs-panel';
import { WorkflowNode } from '@/lib/workflow-types';
import { zh } from '@/lib/i18n';
import { Settings, PlayCircle, History, FileText } from 'lucide-react';

interface WorkflowRightPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onCloseNode: () => void;
  executionResult: any;
  executionLogs: any[];
  onViewHistoryResults: (results: any) => void;
  isExecuting: boolean;
}

export function WorkflowRightPanel({
  selectedNode,
  onUpdateNode,
  onCloseNode,
  executionResult,
  executionLogs,
  onViewHistoryResults,
  isExecuting,
}: WorkflowRightPanelProps) {
  const defaultTab = isExecuting ? 'logs' : selectedNode ? 'config' : 'results';

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background">
      <Tabs defaultValue={defaultTab} className="flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
          <TabsTrigger value="config" className="gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.config}</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1">
            <PlayCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.results}</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.logs}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.history}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="m-0 flex-1 overflow-hidden">
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={onUpdateNode}
            onClose={onCloseNode}
          />
        </TabsContent>

        <TabsContent value="results" className="m-0 flex-1 overflow-hidden">
          <ResultsPanel result={executionResult} onClose={() => {}} />
        </TabsContent>

        <TabsContent value="logs" className="m-0 flex-1 overflow-hidden">
          <ExecutionLogsPanel logs={executionLogs} onClose={() => {}} />
        </TabsContent>

        <TabsContent value="history" className="m-0 flex-1 overflow-hidden">
          <HistoryPanel
            onClose={() => {}}
            onViewResults={onViewHistoryResults}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
