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

  const loadWorkflows = () => {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith('workflow_')
      );
      const loadedWorkflows: WorkflowMetadata[] = keys.map((key) => {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          id: key.replace('workflow_', ''),
          name: data.name || zh.workflow.untitled,
          description: data.description,
          nodeCount: data.nodes?.length || 0,
          edgeCount: data.edges?.length || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          nodes: data.nodes || [],
          edges: data.edges || [],
        };
      });

      // Sort by last updated (newest first)
      loadedWorkflows.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      setWorkflows(loadedWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
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

  const handleDelete = (id: string, name: string) => {
    if (confirm(zh.workflow.confirmDelete.replace('{name}', name))) {
      try {
        localStorage.removeItem(`workflow_${id}`);
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

  const handleDuplicate = (workflow: WorkflowMetadata) => {
    try {
      const newId = Date.now().toString();
      const newWorkflow = {
        name: `${workflow.name} (${zh.workflow.copy})`,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(`workflow_${newId}`, JSON.stringify(newWorkflow));
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{zh.workflow.management}</h1>
          <p className="text-muted-foreground">
            {zh.workflow.managementDescription}
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          {zh.workflow.createNew}
        </Button>
      </div>

      {/* Workflow Grid */}
      {workflows.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <WorkflowIcon className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">
            {zh.workflow.noWorkflows}
          </h3>
          <p className="mb-6 text-muted-foreground">
            {zh.workflow.noWorkflowsDescription}
          </p>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-5 w-5" />
            {zh.workflow.createNew}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="line-clamp-1">{workflow.name}</span>
                  <WorkflowIcon className="ml-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                </CardTitle>
                {workflow.description && (
                  <CardDescription className="line-clamp-2">
                    {workflow.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">{workflow.nodeCount}</span>{' '}
                    {zh.common.nodesCount}
                  </div>
                  <div>
                    <span className="font-medium">{workflow.edgeCount}</span>{' '}
                    {zh.common.connectionsCount}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {zh.workflow.updatedAt} {formatDate(workflow.lastUpdated)}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => handleEdit(workflow.id)}
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1"
                >
                  <Edit className="h-4 w-4" />
                  {zh.workflow.edit}
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
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
