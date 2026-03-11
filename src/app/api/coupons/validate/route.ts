import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Coupon } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Coupon code and subtotal are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code) as Coupon | undefined;

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check if max uses exceeded
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'This coupon has reached its maximum usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (subtotal < coupon.min_order) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.min_order} required for this coupon` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_percent > 0) {
      discount = Math.round((subtotal * coupon.discount_percent) / 100);
    } else if (coupon.discount_amount > 0) {
      discount = coupon.discount_amount;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({ coupon, discount });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
