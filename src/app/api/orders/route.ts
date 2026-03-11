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

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase orders error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Rename order_items to items for frontend compatibility
    const ordersWithItems = (orders || []).map(({ order_items, ...order }) => ({
      ...order,
      items: order_items,
    }));

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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

    const { items, shippingAddress, paymentMethod, couponCode, subtotal, discount, total } = await request.json();

    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Items, shipping address, and payment method are required' },
        { status: 400 }
      );
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        subtotal,
        discount: discount || 0,
        status: 'pending',
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Insert order items
    const orderItems = items.map((item: { product_id: number; product_name: string; quantity: number; size: string; color: string; price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Increment coupon used_count if a coupon was used
    if (couponCode) {
      await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode });
    }

    const fullOrder = { ...order, items: insertedItems };

    return NextResponse.json({ order: fullOrder }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
