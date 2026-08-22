import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET() {
  try {
    const stores = serverDb.getStores();
    const activeStoreId = serverDb.getActiveStoreId();
    return NextResponse.json({ success: true, stores, activeStoreId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Store name is required' }, { status: 400 });
    }
    const store = serverDb.createStore(body);
    return NextResponse.json({ success: true, store }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
