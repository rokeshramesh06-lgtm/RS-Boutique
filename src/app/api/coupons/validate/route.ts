import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Coupon } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Coupon code and subtotal are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    const typedCoupon = coupon as Coupon;

    // Check if coupon is active
    if (!typedCoupon.active) {
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    if (new Date(typedCoupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check if max uses exceeded
    if (typedCoupon.max_uses > 0 && typedCoupon.used_count >= typedCoupon.max_uses) {
      return NextResponse.json(
        { error: 'This coupon has reached its maximum usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (subtotal < typedCoupon.min_order) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${typedCoupon.min_order} required for this coupon` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (typedCoupon.discount_percent > 0) {
      discount = Math.round((subtotal * typedCoupon.discount_percent) / 100);
    } else if (typedCoupon.discount_amount > 0) {
      discount = typedCoupon.discount_amount;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({ coupon: typedCoupon, discount });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
