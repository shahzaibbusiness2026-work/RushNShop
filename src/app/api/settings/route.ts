import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { storeId, settings } = body;
    const targetStoreId = storeId || serverDb.getActiveStoreId();

    const updated = serverDb.updateSettings(targetStoreId, settings);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
