import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const db = getDb();
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Admin coupons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const {
      code,
      discount_percent,
      discount_amount,
      min_order,
      max_uses,
      active,
      expires_at,
    } = await request.json();

    if (!code || !expires_at) {
      return NextResponse.json(
        { error: 'Coupon code and expiration date are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if coupon code already exists
    const existing = db.prepare('SELECT id FROM coupons WHERE code = ?').get(code);
    if (existing) {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 409 }
      );
    }

    const result = db.prepare(
      `INSERT INTO coupons (code, discount_percent, discount_amount, min_order, max_uses, used_count, active, expires_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`
    ).run(
      code,
      discount_percent || 0,
      discount_amount || 0,
      min_order || 0,
      max_uses || 0,
      active ?? 1,
      expires_at
    );

    const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Admin create coupon error:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
