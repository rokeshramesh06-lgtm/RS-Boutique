import { NextResponse } from 'next/server';
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

    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
    const totalRevenue = (db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders').get() as { total: number }).total;
    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;

    const recentOrders = db.prepare(
      `SELECT orders.*, users.name as user_name, users.email as user_email
       FROM orders
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC
       LIMIT 5`
    ).all();

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
