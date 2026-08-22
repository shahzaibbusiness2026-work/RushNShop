import { NextResponse } from 'next/server';
import { serverDb, SAAS_PLANS } from '@/lib/server/db';
import { SubscriptionTier } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const metrics = serverDb.getSaaSMetrics();
    const user = userId ? serverDb.getUserById(userId) : undefined;

    return NextResponse.json({
      success: true,
      plans: SAAS_PLANS,
      metrics,
      userSubscription: user?.subscription,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, tier, billingInterval = 'monthly' } = body;

    if (!userId || !tier) {
      return NextResponse.json({ success: false, error: 'User ID and subscription tier are required' }, { status: 400 });
    }

    const updatedUser = serverDb.updateUserSubscription(
      userId,
      tier as SubscriptionTier,
      'active',
      billingInterval
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const metrics = serverDb.getSaaSMetrics();

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${SAAS_PLANS[tier as SubscriptionTier]?.name || tier}`,
      user: updatedUser,
      subscription: updatedUser.subscription,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
