import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

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
    const { action, email, password, name, role, assignedStoreIds } = body;

    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json({ success: false, message: 'Name, email, and password are required' }, { status: 400 });
      }

      const existing = serverDb.getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 });
      }

      const newUser = serverDb.saveUser({
        name,
        email,
        password,
        role: role || 'store_manager',
        assignedStoreIds: assignedStoreIds || ['*'],
      });

      const { password: _, ...safeUser } = newUser;
      return NextResponse.json({ success: true, user: safeUser, message: 'Account created successfully' });
    }

    // Default: Login
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const user = serverDb.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    if (user.password && user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    if (user.isLocked) {
      return NextResponse.json({ 
        success: false, 
        message: 'This account profile is locked. Please contact your account administrator.' 
      }, { status: 403 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser, message: 'Logged in successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
