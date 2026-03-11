'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

const formatPrice = (price: number) => '₹' + price.toLocaleString('en-IN');

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/orders');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-900" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-ivory-200/60 font-body text-sm mb-3">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gold-400">My Orders</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">My Orders</h1>
          <p className="font-body text-ivory-200/60 text-sm mt-1">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-ivory-300 rounded w-1/4" />
                  <div className="h-5 bg-ivory-300 rounded w-20" />
                </div>
                <div className="h-4 bg-ivory-300 rounded w-1/3 mb-2" />
                <div className="h-4 bg-ivory-300 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-ivory-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-maroon-900/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-bold text-maroon-900 mb-3">No Orders Yet</h2>
            <p className="font-body text-gray-500 mb-8">You have not placed any orders yet. Start exploring our collection!</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-maroon-900 text-white font-body font-semibold text-sm tracking-wide uppercase rounded-lg hover:bg-maroon-800 transition-colors"
            >
              Start Shopping
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-ivory-100/50 transition-colors text-left"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    {/* Order ID */}
                    <div>
                      <p className="font-body text-xs text-gray-500 uppercase tracking-wider">Order</p>
                      <p className="font-display text-xl font-bold text-maroon-900">#{order.id}</p>
                    </div>

                    {/* Date */}
                    <div className="hidden md:block w-[1px] h-8 bg-ivory-300" />
                    <div>
                      <p className="font-body text-xs text-gray-500 uppercase tracking-wider">Date</p>
                      <p className="font-body text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`inline-block w-fit px-3 py-1 rounded-full font-body text-xs font-semibold capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-body text-xs text-gray-500">Total</p>
                      <p className="font-display text-xl font-bold text-maroon-900">{formatPrice(order.total)}</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedOrder === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Order Items (Expanded) */}
                {expandedOrder === order.id && (
                  <div className="border-t border-ivory-300 px-5 md:px-6 py-4 bg-ivory-100/30">
                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-ivory-300">
                      <div>
                        <p className="font-body text-xs text-gray-500 mb-1">Payment Method</p>
                        <p className="font-body text-sm text-maroon-900 font-medium">{order.payment_method}</p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-gray-500 mb-1">Shipping Address</p>
                        <p className="font-body text-sm text-gray-700">{order.shipping_address}</p>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          <div className="flex justify-between md:justify-end gap-4 font-body text-sm">
                            <span className="text-gray-500">Subtotal:</span>
                            <span className="text-maroon-900">{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between md:justify-end gap-4 font-body text-sm">
                              <span className="text-green-600">Discount:</span>
                              <span className="text-green-600">-{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between md:justify-end gap-4 font-body text-sm font-semibold">
                            <span className="text-maroon-900">Total:</span>
                            <span className="text-maroon-900">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <p className="font-body text-xs text-gray-500 uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg p-3">
                          <div className="w-2 h-12 bg-gradient-to-b from-maroon-900 to-gold-500 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-medium text-maroon-900 truncate">{item.product_name}</p>
                            <p className="font-body text-xs text-gray-500">
                              {item.size} / {item.color} &middot; Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-body text-sm font-semibold text-maroon-900 flex-shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
