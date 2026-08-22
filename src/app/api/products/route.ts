import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || serverDb.getActiveStoreId();
    const products = serverDb.getProducts(storeId);
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, product } = body;
    const targetStoreId = storeId || serverDb.getActiveStoreId();
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product data required' }, { status: 400 });
    }

    const saved = serverDb.saveProduct(targetStoreId, product);
    return NextResponse.json({ success: true, product: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
