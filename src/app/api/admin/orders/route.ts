import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, profiles(name, email), order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase admin orders error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Map to rename profiles fields and order_items
    const ordersWithItems = (orders || []).map(({ profiles, order_items, ...order }) => ({
      ...order,
      user_name: (profiles as { name: string; email: string } | null)?.name || null,
      user_email: (profiles as { name: string; email: string } | null)?.email || null,
      items: order_items,
    }));

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, profiles(name, email)')
      .single();

    if (error || !order) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      console.error('Supabase update order error:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Map profile fields
    const { profiles: orderProfiles, ...orderData } = order;
    const mappedOrder = {
      ...orderData,
      user_name: (orderProfiles as { name: string; email: string } | null)?.name || null,
      user_email: (orderProfiles as { name: string; email: string } | null)?.email || null,
    };

    return NextResponse.json({ order: mappedOrder });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
