import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';
import { UserAccount } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = serverDb.getUsers().map(({ password, ...rest }) => rest);
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, assignedStoreIds, isLocked } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    const existing = serverDb.getUserByEmail(email);
    if (existing && !body.id) {
      return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 409 });
    }

    const saved = serverDb.saveUser({
      id: body.id,
      name,
      email,
      password: password || 'rushnshop2026',
      role: role || 'store_manager',
      assignedStoreIds: assignedStoreIds || ['*'],
      isLocked: Boolean(isLocked),
    });

    const { password: _, ...safeUser } = saved;
    return NextResponse.json({ success: true, user: safeUser, message: 'User saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const deleted = serverDb.deleteUser(userId);
    if (!deleted) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot delete the primary owner account or user not found' 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, isLocked, role, assignedStoreIds, name } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = serverDb.getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const updated = serverDb.saveUser({
      ...user,
      ...(name !== undefined && { name }),
      ...(role !== undefined && { role }),
      ...(assignedStoreIds !== undefined && { assignedStoreIds }),
      ...(isLocked !== undefined && { isLocked }),
    });

    const { password: _, ...safeUser } = updated;
    return NextResponse.json({ success: true, user: safeUser, message: 'User updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
