import { NextResponse } from 'next/server';
import { executionDb } from '@/lib/db-operations';
import { zh } from '@/lib/i18n';

export async function GET() {
  try {
    const history = executionDb.getAll(100);
    return NextResponse.json(history);
  } catch (_error) {
    return NextResponse.json(
      { error: zh.errors.getHistoryFailed },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: zh.errors.missingId }, { status: 400 });
    }

    executionDb.delete(id);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: zh.errors.deleteFailed },
      { status: 500 }
    );
  }
}
