'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeConfigPanel } from './node-config-panel';
import { ResultsPanel } from './results-panel';
import { HistoryPanel } from './history-panel';
import { WorkflowNode } from '@/lib/workflow-types';
import { zh } from '@/lib/i18n';
import { Settings, PlayCircle, History } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WorkflowRightPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onCloseNode: () => void;
  executionResult: any;
  onViewHistoryResults: (results: any) => void;
  isExecuting: boolean;
}

export function WorkflowRightPanel({
  selectedNode,
  onUpdateNode,
  onCloseNode,
  executionResult,
  onViewHistoryResults,
  isExecuting,
}: WorkflowRightPanelProps) {
  const [activeTab, setActiveTab] = useState('results');

  // 当点击节点时，切换到配置tab
  useEffect(() => {
    if (selectedNode) {
      setActiveTab('config');
    }
  }, [selectedNode]);

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="config" className="gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.config}</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1">
            <PlayCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.results}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{zh.panels.history}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="m-0 flex-1 overflow-y-auto">
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={onUpdateNode}
            onClose={onCloseNode}
          />
        </TabsContent>

        <TabsContent value="results" className="m-0 flex-1 overflow-y-auto">
          <ResultsPanel result={executionResult} onClose={() => {}} />
        </TabsContent>

        <TabsContent value="history" className="m-0 flex-1 overflow-y-auto">
          <HistoryPanel
            onClose={() => {}}
            onViewResults={onViewHistoryResults}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
