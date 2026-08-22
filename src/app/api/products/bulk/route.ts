import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';
import { ProductItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, products } = body;

    if (!storeId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'storeId and an array of products are required' }, { status: 400 });
    }

    const createdList: ProductItem[] = [];
    for (const prod of products) {
      const saved = serverDb.saveProduct(storeId, prod);
      createdList.push(saved);
    }

    return NextResponse.json({
      success: true,
      count: createdList.length,
      products: createdList,
    });
  } catch (error) {
    console.error('Error bulk creating products:', error);
    return NextResponse.json({ error: 'Failed bulk creating products' }, { status: 500 });
  }
}
