import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || undefined;
    const listings = serverDb.getListings(storeId);
    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, listing } = body;
    const targetStoreId = storeId || serverDb.getActiveStoreId();

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing data required' }, { status: 400 });
    }

    const saved = serverDb.saveListing(targetStoreId, listing);
    return NextResponse.json({ success: true, listing: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
