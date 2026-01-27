'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Copy,
  Play,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { zh } from '@/lib/i18n';

interface WorkflowMetadata {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
  edgeCount: number;
  lastUpdated: string;
  nodes: any[];
  edges: any[];
}

export function WorkflowListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      // 从数据库加载
      const response = await fetch('/api/workflow');
      if (!response.ok) {
        throw new Error('Failed to load from database');
      }

      const dbWorkflows = await response.json();

      // 转换格式
      const loadedWorkflows: WorkflowMetadata[] = dbWorkflows.map(
        (wf: any) => ({
          id: wf.id, // 保留完整的 ID，包括 workflow_ 前缀
          name: wf.name || zh.workflow.untitled,
          description: wf.description,
          nodeCount: wf.nodes?.length || 0,
          edgeCount: wf.edges?.length || 0,
          lastUpdated: wf.updatedAt || wf.createdAt || new Date().toISOString(),
          nodes: wf.nodes || [],
          edges: wf.edges || [],
        })
      );

      // Sort by last updated (newest first)
      loadedWorkflows.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      setWorkflows(loadedWorkflows);
    } catch (error) {
      console.error('Failed to load workflows from database:', error);
      toast({
        title: zh.workflow.loadError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/workflow/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/workflow/${id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(zh.workflow.confirmDelete.replace('{name}', name))) {
      try {
        // 从数据库删除
        const response = await fetch(`/api/workflow?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete from database');
        }

        toast({
          title: zh.workflow.deleted,
        });
        loadWorkflows();
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        toast({
          title: zh.workflow.deleteFailed,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDuplicate = async (workflow: WorkflowMetadata) => {
    try {
      const newId = `workflow_${crypto.randomUUID()}`;
      const newWorkflow = {
        id: newId,
        name: `${workflow.name} (${zh.workflow.copy})`,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 保存到数据库
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkflow),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate workflow');
      }

      toast({
        title: zh.workflow.duplicated,
      });
      loadWorkflows();
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      toast({
        title: zh.workflow.duplicateFailed,
        variant: 'destructive',
      });
    }
  };

  const handleExport = (workflow: WorkflowMetadata) => {
    try {
      const data = {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.name || 'workflow'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: zh.workflow.exported,
      });
    } catch (error) {
      console.error('Failed to export workflow:', error);
      toast({
        title: zh.workflow.exportFailed,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return zh.workflow.justNow;
    if (diffMins < 60)
      return zh.workflow.minutesAgo.replace('{count}', diffMins.toString());
    if (diffHours < 24)
      return zh.workflow.hoursAgo.replace('{count}', diffHours.toString());
    if (diffDays < 7)
      return zh.workflow.daysAgo.replace('{count}', diffDays.toString());
    return date.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <WorkflowIcon className="mx-auto mb-4 h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">{zh.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Workflow Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {workflows.length === 0 ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <WorkflowIcon className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">
              {zh.workflow.noWorkflows}
            </h3>
            <p className="mb-6 text-center text-muted-foreground">
              {zh.workflow.noWorkflowsDescription}
            </p>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-5 w-5" />
              {zh.workflow.createNew}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="flex flex-col transition-all hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 flex-1 text-base">
                      {workflow.name}
                    </span>
                    <WorkflowIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  </CardTitle>
                  {workflow.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {workflow.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  <div className="mb-3 flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">
                        {workflow.nodeCount}
                      </span>
                      <span className="text-xs">{zh.common.nodesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">
                        {workflow.edgeCount}
                      </span>
                      <span className="text-xs">
                        {zh.common.connectionsCount}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 text-xs text-muted-foreground">
                    {zh.workflow.updatedAt} {formatDate(workflow.lastUpdated)}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 border-t pt-3">
                  <Button
                    onClick={() => handleEdit(workflow.id)}
                    variant="default"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">{zh.workflow.edit}</span>
                  </Button>
                  <Button
                    onClick={() => handleDuplicate(workflow)}
                    variant="outline"
                    size="sm"
                    title={zh.workflow.duplicate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleExport(workflow)}
                    variant="outline"
                    size="sm"
                    title={zh.workflow.export}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(workflow.id, workflow.name)}
                    variant="outline"
                    size="sm"
                    title={zh.workflow.delete}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
