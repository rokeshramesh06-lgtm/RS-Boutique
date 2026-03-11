import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase admin coupons error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: 500 }
      );
    }

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
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
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

    // Check if coupon code already exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 409 }
      );
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code,
        discount_percent: discount_percent || 0,
        discount_amount: discount_amount || 0,
        min_order: min_order || 0,
        max_uses: max_uses || 0,
        used_count: 0,
        active: active ?? true,
        expires_at,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase create coupon error:', error);
      return NextResponse.json(
        { error: 'Failed to create coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Admin create coupon error:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
