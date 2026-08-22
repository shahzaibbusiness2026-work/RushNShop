import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const store = serverDb.getStore(id);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, store });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const success = serverDb.deleteStore(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Cannot delete the only remaining store' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Store deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
