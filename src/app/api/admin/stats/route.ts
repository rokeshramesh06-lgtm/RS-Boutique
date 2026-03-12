import { NextResponse } from 'next/server';
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

    // Get total orders count
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total');
    const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (order.total || 0), 0);

    // Get total products count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get recent orders with user info
    const { data: recentOrdersRaw } = await supabase
      .from('orders')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentOrders = (recentOrdersRaw || []).map(({ profiles, ...order }) => ({
      ...order,
      user_name: (profiles as { name: string; email: string } | null)?.name || null,
      user_email: (profiles as { name: string; email: string } | null)?.email || null,
    }));

    return NextResponse.json({
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers || 0,
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
