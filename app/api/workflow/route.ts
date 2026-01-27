import { NextRequest, NextResponse } from 'next/server';
import { workflowDb } from '@/lib/db-operations';

// GET /api/workflow - 获取所有workflow
export async function GET() {
  try {
    const workflows = workflowDb.getAll();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Failed to get workflows:', error);
    return NextResponse.json(
      { error: 'Failed to get workflows' },
      { status: 500 }
    );
  }
}

// POST /api/workflow - 创建或更新workflow
export async function POST(request: NextRequest) {
  try {
    const workflow = await request.json();

    // 确保有必要的字段
    if (!workflow.id || !workflow.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    workflowDb.save(workflow);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save workflow:', error);
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    );
  }
}

// DELETE /api/workflow?id=xxx - 删除workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing workflow id' },
        { status: 400 }
      );
    }

    workflowDb.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
