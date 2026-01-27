'use client';

import { useCallback, useState, useRef, DragEvent, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './custom-node';
import { NodePanel } from './node-panel';
import { WorkflowRightPanel } from './workflow-right-panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Play, Save, Download, Upload, Trash2 } from 'lucide-react';
import { NodeType, WorkflowNode, Workflow } from '@/lib/workflow-types';
import { zh } from '@/lib/i18n';

const nodeTypes = {
  start: CustomNode,
  end: CustomNode,
  input: CustomNode,
  'ai-extract': CustomNode,
  'ai-analyze': CustomNode,
  'ai-filter': CustomNode,
  'batch-crawl': CustomNode,
  'search-engine': CustomNode,
  'data-transform': CustomNode,
  export: CustomNode,
  output: CustomNode,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

interface WorkflowEditorContentProps {
  workflowId?: string;
}

function WorkflowEditorContent({ workflowId }: WorkflowEditorContentProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [workflowName, setWorkflowName] = useState(zh.common.untitledWorkflow);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<
    string | undefined
  >(workflowId);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { toast } = useToast();

  // Load workflow on mount if workflowId is provided
  useEffect(() => {
    if (workflowId) {
      // 从数据库加载
      fetch(`/api/workflow/${workflowId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load');
          return res.json();
        })
        .then((workflow) => {
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
          setWorkflowName(workflow.name || zh.common.untitledWorkflow);
          setCurrentWorkflowId(workflowId);

          // 重置nodeId计数器，避免ID冲突
          // 找到最大的节点ID数字
          const maxId = (workflow.nodes || []).reduce(
            (max: number, node: any) => {
              const match = node.id.match(/^node_(\d+)$/);
              if (match) {
                const num = parseInt(match[1], 10);
                return num > max ? num : max;
              }
              return max;
            },
            -1
          );
          nodeId = maxId + 1;
        })
        .catch((error) => {
          console.error('Failed to load workflow from database:', error);
          toast({
            title: '加载失败',
            description: '无法加载工作流数据',
            variant: 'destructive',
          });
        });
    }
  }, [workflowId, setNodes, setEdges, toast]);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // 当节点被删除时，如果删除的是当前选中的节点，清除选中状态
      if (selectedNode && deleted.some((node) => node.id === selectedNode.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        'application/reactflow'
      ) as NodeType;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getNodeId(),
        type,
        position,
        data: {
          label: getDefaultLabel(type),
          nodeType: type,
          ...getDefaultNodeData(type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getDefaultLabel = (type: NodeType): string => {
    return zh.nodeTypes[type];
  };

  const getDefaultNodeData = (type: NodeType): any => {
    switch (type) {
      case 'start':
        return { triggerType: 'manual' };
      case 'end':
        return { action: 'none' };
      case 'input':
        return { inputType: 'single' };
      case 'ai-extract':
        return { extractionType: 'content' };
      case 'ai-analyze':
        return { analysisType: 'summary' };
      case 'ai-filter':
        return { filterType: 'keyword' };
      case 'batch-crawl':
        return { maxDepth: 2, maxPages: 10, followLinks: true };
      case 'search-engine':
        return { searchEngine: 'google', maxResults: 10 };
      case 'data-transform':
        return { transformType: 'map' };
      case 'export':
        return { exportFormat: 'json' };
      case 'output':
        return { outputType: 'display' };
      default:
        return {};
    }
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as unknown as WorkflowNode);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNode['data']>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            };
          }
          return node;
        })
      );

      // Update selected node
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  ...data,
                },
              }
            : null
        );
      }
    },
    [setNodes, selectedNode]
  );

  const saveWorkflow = useCallback(async () => {
    const id = currentWorkflowId || `workflow_${crypto.randomUUID()}`;
    const workflow = {
      id,
      name: workflowName,
      description: '',
      nodes: nodes,
      edges: edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 保存到数据库
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      if (!currentWorkflowId) {
        setCurrentWorkflowId(id);
      }

      toast({
        title: zh.messages.workflowSaved,
        description: zh.messages.workflowSavedSuccess.replace(
          '{name}',
          workflowName
        ),
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast({
        title: '保存失败',
        description: '无法保存工作流',
        variant: 'destructive',
      });
    }
  }, [nodes, edges, workflowName, currentWorkflowId, toast]);

  const exportWorkflow = useCallback(() => {
    const workflow: Workflow = {
      id: `workflow_${crypto.randomUUID()}`,
      name: workflowName,
      nodes: nodes as unknown as WorkflowNode[],
      edges: edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${workflowName.replace(/\s+/g, '_')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: zh.messages.workflowExported,
      description: zh.messages.exportedAsJson,
    });
  }, [nodes, edges, workflowName, toast]);

  const importWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const workflow: Workflow = JSON.parse(
              event.target?.result as string
            );
            setNodes(workflow.nodes as unknown as Node[]);
            setEdges(workflow.edges as Edge[]);
            setWorkflowName(workflow.name);
            toast({
              title: zh.messages.workflowImported,
              description: zh.messages.workflowLoaded.replace(
                '{name}',
                workflow.name
              ),
            });
          } catch (error: any) {
            console.error('Import error:', error);
            toast({
              title: zh.messages.importFailed,
              description: zh.messages.invalidWorkflowFile,
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges, toast]);

  const clearWorkflow = useCallback(() => {
    if (confirm(zh.messages.confirmClear)) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setWorkflowName(zh.common.untitledWorkflow);
      toast({
        title: zh.messages.workflowCleared,
        description: zh.messages.allNodesRemoved,
      });
    }
  }, [setNodes, setEdges, toast]);

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: zh.messages.noWorkflow,
        description: zh.messages.addNodesFirst,
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    setExecutionLogs([]);
    setExecutionResult(null);
    setExecutingNodeId(null);

    toast({
      title: zh.messages.executingWorkflow,
      description: zh.messages.workflowExecuting,
    });

    try {
      const response = await fetch('/api/workflow/execute/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          workflowName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Execution failed: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // 检查是否是错误消息
              if (data.error) {
                throw new Error(data.error);
              }

              // Update executing node visual state
              if (data.type === 'node_start') {
                setExecutingNodeId(data.nodeId);
                // Highlight the executing node
                setNodes((nds) =>
                  nds.map((node) => ({
                    ...node,
                    data: {
                      ...node.data,
                      isExecuting: node.id === data.nodeId,
                    },
                  }))
                );
              } else if (
                data.type === 'node_complete' ||
                data.type === 'node_error'
              ) {
                setExecutingNodeId(null);
                // Remove executing state
                setNodes((nds) =>
                  nds.map((node) => ({
                    ...node,
                    data: {
                      ...node.data,
                      isExecuting: false,
                      isCompleted:
                        node.id === data.nodeId &&
                        data.type === 'node_complete',
                      isError:
                        node.id === data.nodeId && data.type === 'node_error',
                    },
                  }))
                );
              }

              setExecutionLogs((prev) => [
                ...prev,
                {
                  ...data,
                  timestamp: new Date().toISOString(),
                },
              ]);

              if (data.type === 'complete') {
                setExecutionResult(data);
                toast({
                  title: zh.messages.executionComplete,
                  description: zh.messages.processedItems.replace(
                    '{count}',
                    String(data.results?.length || 0)
                  ),
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: zh.messages.executionFailed,
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      setExecutionLogs((prev) => [
        ...prev,
        {
          type: 'node_error',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsExecuting(false);
      setExecutingNodeId(null);
      // Clear all execution states
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isExecuting: false,
          },
        }))
      );
    }
  }, [nodes, edges, workflowName, toast, setNodes]);

  return (
    <div className="flex h-full w-full">
      {/* Left Panel - Node Library */}
      <div className="w-64 overflow-y-auto border-r bg-background">
        <NodePanel />
      </div>

      {/* Center - Workflow Canvas */}
      <div className="flex flex-1 flex-col">
        <div className="flex-shrink-0 border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="rounded border-none bg-transparent px-2 text-xl font-bold outline-none focus:ring-2 focus:ring-primary"
              placeholder="工作流名称"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={importWorkflow}
                disabled={isExecuting}
              >
                <Upload className="mr-2 h-4 w-4" />
                {zh.toolbar.import}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportWorkflow}
                disabled={isExecuting}
              >
                <Download className="mr-2 h-4 w-4" />
                {zh.toolbar.export}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveWorkflow}
                disabled={isExecuting}
              >
                <Save className="mr-2 h-4 w-4" />
                {zh.toolbar.save}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearWorkflow}
                disabled={isExecuting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {zh.toolbar.clear}
              </Button>
              <Button
                size="sm"
                onClick={executeWorkflow}
                disabled={isExecuting}
              >
                <Play className="mr-2 h-4 w-4" />
                {isExecuting ? zh.toolbar.executing : zh.toolbar.execute}
              </Button>
            </div>
          </div>
        </div>

        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Right Panel - Tabs */}
      <WorkflowRightPanel
        selectedNode={selectedNode}
        onUpdateNode={updateNodeData}
        onCloseNode={() => setSelectedNode(null)}
        executionResult={executionResult}
        executionLogs={executionLogs}
        onViewHistoryResults={(results) => {
          setExecutionResult(results);
        }}
        isExecuting={isExecuting}
      />
    </div>
  );
}

export function WorkflowEditor({ workflowId }: { workflowId?: string }) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
