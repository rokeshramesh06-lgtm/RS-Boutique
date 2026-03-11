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

    const db = getDb();

    const orders = db.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(user.id) as Array<Record<string, unknown>>;

    // Attach order items to each order
    const getOrderItems = db.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    );

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: getOrderItems.all(order.id as number),
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
    const user = await getCurrentUser();
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

    const db = getDb();

    // Create the order
    const orderResult = db.prepare(
      `INSERT INTO orders (user_id, total, subtotal, discount, status, shipping_address, payment_method, coupon_code)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`
    ).run(
      user.id,
      total,
      subtotal,
      discount || 0,
      shippingAddress,
      paymentMethod,
      couponCode || null
    );

    const orderId = orderResult.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, size, color, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    for (const item of items) {
      insertItem.run(
        orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.size,
        item.color,
        item.price
      );
    }

    // Increment coupon used_count if a coupon was used
    if (couponCode) {
      db.prepare(
        'UPDATE coupons SET used_count = used_count + 1 WHERE code = ?'
      ).run(couponCode);
    }

    // Fetch the created order with items
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    const fullOrder = { ...order as Record<string, unknown>, items: orderItems };

    return NextResponse.json({ order: fullOrder }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
