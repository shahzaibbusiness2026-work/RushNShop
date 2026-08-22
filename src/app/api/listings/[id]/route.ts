import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || serverDb.getActiveStoreId();

    const success = serverDb.deleteListing(storeId, params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Listing deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
