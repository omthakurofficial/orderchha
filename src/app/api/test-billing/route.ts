import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 API: Testing getBillingReadyOrders...');
    
    const billingOrders = await db.getBillingReadyOrders();
    
    console.log('📊 API: Billing orders result:', {
      count: billingOrders?.length || 0,
      orders: billingOrders
    });

    return NextResponse.json({
      success: true,
      count: billingOrders?.length || 0,
      orders: billingOrders
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
