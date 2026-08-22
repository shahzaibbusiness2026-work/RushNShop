import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { storeId, product } = body;
    const targetStoreId = storeId || serverDb.getActiveStoreId();

    const updated = serverDb.saveProduct(targetStoreId, { ...product, id: params.id });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || serverDb.getActiveStoreId();

    const success = serverDb.deleteProduct(storeId, params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
