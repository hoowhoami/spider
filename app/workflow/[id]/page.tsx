'use client';

import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { useParams } from 'next/navigation';

export default function WorkflowEditorPage() {
  const params = useParams();
  const workflowId = params.id as string;

  return (
    <div className="h-full">
      <WorkflowEditor
        workflowId={workflowId === 'new' ? undefined : workflowId}
      />
    </div>
  );
}
