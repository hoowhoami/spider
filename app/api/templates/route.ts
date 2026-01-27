import { NextRequest, NextResponse } from 'next/server';
import { workflowDb } from '@/lib/db-operations';
import { Workflow } from '@/lib/workflow-types';
import { zh } from '@/lib/i18n';

export async function GET() {
  try {
    const templates = workflowDb.getTemplates();
    return NextResponse.json(templates);
  } catch (_error) {
    return NextResponse.json(
      { error: zh.errors.getTemplateFailed },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow, category } = body as {
      workflow: Workflow;
      category: string;
    };

    workflowDb.saveAsTemplate(workflow, category);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: zh.errors.saveTemplateFailed },
      { status: 500 }
    );
  }
}
