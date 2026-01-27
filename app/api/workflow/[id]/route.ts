import { NextRequest, NextResponse } from 'next/server';
import { workflowDb } from '@/lib/db-operations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 如果ID不带 workflow_ 前缀，添加前缀
    const workflowId = id.startsWith('workflow_') ? id : `workflow_${id}`;
    const workflow = workflowDb.getById(workflowId);

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Failed to get workflow:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow' },
      { status: 500 }
    );
  }
}
