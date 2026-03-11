'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Product, Coupon, Order } from '@/types';

const formatPrice = (price: number) => '₹' + price.toLocaleString('en-IN');
const CATEGORIES = ['Sarees', 'Churidar', 'Nighty'];
const GENDERS = ['Women'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category: string;
  gender: string;
  sizes: string[];
  colors: string;
  image_url: string;
  image_gradient: string;
  in_stock: boolean;
  featured: boolean;
}

interface CouponForm {
  code: string;
  discount_percent: string;
  discount_amount: string;
  min_order: string;
  max_uses: string;
  expires_at: string;
  active: boolean;
}

const emptyProductForm: ProductForm = {
  name: '', description: '', price: '', original_price: '',
  category: 'Sarees', gender: 'Women', sizes: ['M'],
  colors: '', image_url: '', image_gradient: '#8B1A1A to #C9A84C',
  in_stock: true, featured: false,
};

const emptyCouponForm: CouponForm = {
  code: '', discount_percent: '', discount_amount: '',
  min_order: '', max_uses: '', expires_at: '', active: true,
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Coupon form
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponForm>(emptyCouponForm);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);

    try {
      const [statsRes, productsRes, couponsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/products'),
        fetch('/api/admin/coupons'),
        fetch('/api/admin/orders'),
      ]);

      const [statsData, productsData, couponsData, ordersData] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        couponsRes.json(),
        ordersRes.json(),
      ]);

      setStats(statsData);
      setProducts(productsData.products || []);
      setCoupons(couponsData.coupons || []);
      setOrders(ordersData.orders || []);
    } catch {
      // Handle errors silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Product CRUD
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaving(true);
    setProductError('');

    const body = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      original_price: parseFloat(productForm.original_price),
      category: productForm.category,
      gender: productForm.gender,
      sizes: productForm.sizes.join(', '),
      colors: productForm.colors,
      image_url: productForm.image_url,
      image_gradient: productForm.image_gradient,
      in_stock: productForm.in_stock ? 1 : 0,
      featured: productForm.featured ? 1 : 0,
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      fetchData();
    } catch (err: unknown) {
      setProductError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setProductSaving(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      original_price: product.original_price.toString(),
      category: product.category,
      gender: product.gender,
      sizes: product.sizes.split(',').map((s) => s.trim()),
      colors: product.colors,
      image_url: product.image_url || '',
      image_gradient: product.image_gradient,
      in_stock: product.in_stock === 1,
      featured: product.featured === 1,
    });
    setEditingProduct(product.id);
    setShowProductForm(true);
    setProductError('');
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch {
      // Handle silently
    }
  };

  // Coupon CRUD
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSaving(true);
    setCouponError('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code.toUpperCase(),
          discount_percent: parseFloat(couponForm.discount_percent) || 0,
          discount_amount: parseFloat(couponForm.discount_amount) || 0,
          min_order: parseFloat(couponForm.min_order) || 0,
          max_uses: parseInt(couponForm.max_uses) || 100,
          expires_at: couponForm.expires_at,
          active: couponForm.active ? 1 : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create coupon');
      }

      setShowCouponForm(false);
      setCouponForm(emptyCouponForm);
      fetchData();
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setCouponSaving(false);
    }
  };

  // Order status update
  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      fetchData();
    } catch {
      // Handle silently
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-900" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { key: 'products', label: 'Products', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { key: 'coupons', label: 'Coupons', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )},
    { key: 'orders', label: 'Orders', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Admin Panel</h1>
          <p className="font-body text-ivory-200/60 text-sm mt-1">Manage your store</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-ivory-300 sticky top-[70px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 font-body text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-maroon-900 text-maroon-900'
                    : 'border-transparent text-gray-500 hover:text-maroon-900 hover:border-maroon-900/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-900" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-maroon-900">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-sm text-gray-500">Total Revenue</p>
                      <div className="w-10 h-10 bg-maroon-900/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-maroon-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-maroon-900">{formatPrice(stats.totalRevenue)}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-gold-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-sm text-gray-500">Total Orders</p>
                      <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-maroon-900">{stats.totalOrders}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-sm text-gray-500">Total Products</p>
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-maroon-900">{stats.totalProducts}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-sm text-gray-500">Total Users</p>
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-maroon-900">{stats.totalUsers}</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-ivory-300">
                    <h2 className="font-display text-xl font-bold text-maroon-900">Recent Orders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ivory-100">
                        <tr>
                          <th className="text-left px-6 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="text-left px-6 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="text-left px-6 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="text-left px-6 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ivory-300">
                        {(stats.recentOrders || []).slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-ivory-100/50 transition-colors">
                            <td className="px-6 py-4 font-body text-sm font-semibold text-maroon-900">#{order.id}</td>
                            <td className="px-6 py-4 font-body text-sm text-gray-700">{order.user_name || order.user_email || '-'}</td>
                            <td className="px-6 py-4 font-body text-sm font-semibold text-maroon-900">{formatPrice(order.total)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full font-body text-xs font-semibold capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-body text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                      <div className="text-center py-10">
                        <p className="font-body text-gray-400 text-sm">No recent orders</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-maroon-900">Products ({products.length})</h2>
                  <button
                    onClick={() => {
                      setProductForm(emptyProductForm);
                      setEditingProduct(null);
                      setShowProductForm(true);
                      setProductError('');
                    }}
                    className="px-5 py-2.5 bg-maroon-900 text-white font-body text-sm font-semibold rounded-lg hover:bg-maroon-800 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>

                {/* Product Form Modal */}
                {showProductForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-2xl font-bold text-maroon-900">
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-gray-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {productError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="font-body text-sm text-red-600">{productError}</p>
                        </div>
                      )}

                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Name *</label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Description *</label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Price *</label>
                            <input
                              type="number"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              required
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Original Price *</label>
                            <input
                              type="number"
                              value={productForm.original_price}
                              onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                              required
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Category *</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            >
                              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Gender *</label>
                            <select
                              value={productForm.gender}
                              onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            >
                              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Sizes</label>
                          <div className="flex flex-wrap gap-2">
                            {SIZE_OPTIONS.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setProductForm({
                                    ...productForm,
                                    sizes: productForm.sizes.includes(size)
                                      ? productForm.sizes.filter((s) => s !== size)
                                      : [...productForm.sizes, size],
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-lg font-body text-xs transition-all ${
                                  productForm.sizes.includes(size)
                                    ? 'bg-maroon-900 text-white'
                                    : 'bg-ivory-200 text-gray-600 hover:bg-ivory-300'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Colors (comma separated)</label>
                          <input
                            type="text"
                            value={productForm.colors}
                            onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                            placeholder="Red, Gold, Maroon"
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Image URL</label>
                          <input
                            type="text"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                          />
                          {productForm.image_url && (
                            <img
                              src={productForm.image_url}
                              alt="Preview"
                              className="mt-2 h-20 w-20 object-cover rounded-lg"
                            />
                          )}
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Fallback Gradient</label>
                          <input
                            type="text"
                            value={productForm.image_gradient}
                            onChange={(e) => setProductForm({ ...productForm, image_gradient: e.target.value })}
                            placeholder="#8B1A1A to #C9A84C"
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                          />
                          {productForm.image_gradient && (
                            <div
                              className="mt-2 h-8 rounded-lg"
                              style={{ background: `linear-gradient(135deg, ${productForm.image_gradient.replace(' to ', ', ')})` }}
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={productForm.in_stock}
                              onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                              className="w-4 h-4 accent-maroon-900"
                            />
                            <span className="font-body text-sm text-gray-700">In Stock</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={productForm.featured}
                              onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                              className="w-4 h-4 accent-maroon-900"
                            />
                            <span className="font-body text-sm text-gray-700">Featured</span>
                          </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={productSaving}
                            className="flex-1 py-3 bg-maroon-900 text-white font-body font-semibold text-sm rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
                          >
                            {productSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowProductForm(false)}
                            className="px-6 py-3 border border-ivory-300 text-gray-600 font-body text-sm rounded-lg hover:bg-ivory-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ivory-100">
                        <tr>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Gender</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="text-right px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ivory-300">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-ivory-100/50 transition-colors">
                            <td className="px-4 py-3 font-body text-sm text-gray-500">#{product.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md flex-shrink-0 overflow-hidden">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full" style={{ background: product.image_gradient }} />
                                  )}
                                </div>
                                <span className="font-body text-sm font-medium text-maroon-900 truncate max-w-[200px]">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-body text-sm text-gray-600">{product.category}</td>
                            <td className="px-4 py-3 font-body text-sm text-gray-600">{product.gender}</td>
                            <td className="px-4 py-3 font-body text-sm font-semibold text-maroon-900">{formatPrice(product.price)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full font-body text-xs font-semibold ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                {deleteConfirm === product.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="px-2 py-1 bg-red-600 text-white font-body text-xs rounded hover:bg-red-700"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-2 py-1 bg-gray-200 text-gray-600 font-body text-xs rounded hover:bg-gray-300"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(product.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length === 0 && (
                      <div className="text-center py-10">
                        <p className="font-body text-gray-400 text-sm">No products found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-maroon-900">Coupons ({coupons.length})</h2>
                  <button
                    onClick={() => {
                      setCouponForm(emptyCouponForm);
                      setShowCouponForm(true);
                      setCouponError('');
                    }}
                    className="px-5 py-2.5 bg-maroon-900 text-white font-body text-sm font-semibold rounded-lg hover:bg-maroon-800 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Coupon
                  </button>
                </div>

                {/* Coupon Form Modal */}
                {showCouponForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-2xl font-bold text-maroon-900">Add New Coupon</h3>
                        <button onClick={() => setShowCouponForm(false)} className="text-gray-400 hover:text-gray-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {couponError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="font-body text-sm text-red-600">{couponError}</p>
                        </div>
                      )}

                      <form onSubmit={handleCouponSubmit} className="space-y-4">
                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Coupon Code *</label>
                          <input
                            type="text"
                            value={couponForm.code}
                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                            required
                            placeholder="e.g. SAVE20"
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all uppercase"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Discount (%)</label>
                            <input
                              type="number"
                              value={couponForm.discount_percent}
                              onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })}
                              placeholder="0"
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Discount (Fixed)</label>
                            <input
                              type="number"
                              value={couponForm.discount_amount}
                              onChange={(e) => setCouponForm({ ...couponForm, discount_amount: e.target.value })}
                              placeholder="0"
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Min Order Amount</label>
                            <input
                              type="number"
                              value={couponForm.min_order}
                              onChange={(e) => setCouponForm({ ...couponForm, min_order: e.target.value })}
                              placeholder="0"
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Max Uses</label>
                            <input
                              type="number"
                              value={couponForm.max_uses}
                              onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                              placeholder="100"
                              className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Expires At</label>
                          <input
                            type="date"
                            value={couponForm.expires_at}
                            onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                            className="w-full px-4 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={couponForm.active}
                            onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                            className="w-4 h-4 accent-maroon-900"
                          />
                          <span className="font-body text-sm text-gray-700">Active</span>
                        </label>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={couponSaving}
                            className="flex-1 py-3 bg-maroon-900 text-white font-body font-semibold text-sm rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
                          >
                            {couponSaving ? 'Creating...' : 'Create Coupon'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCouponForm(false)}
                            className="px-6 py-3 border border-ivory-300 text-gray-600 font-body text-sm rounded-lg hover:bg-ivory-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Coupons Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ivory-100">
                        <tr>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Value</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Min Order</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Uses</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Expires</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ivory-300">
                        {coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-ivory-100/50 transition-colors">
                            <td className="px-4 py-3 font-body text-sm font-semibold text-maroon-900">{coupon.code}</td>
                            <td className="px-4 py-3 font-body text-sm text-gray-600">
                              {coupon.discount_percent > 0 ? 'Percentage' : 'Fixed'}
                            </td>
                            <td className="px-4 py-3 font-body text-sm font-semibold text-maroon-900">
                              {coupon.discount_percent > 0 ? `${coupon.discount_percent}%` : formatPrice(coupon.discount_amount)}
                            </td>
                            <td className="px-4 py-3 font-body text-sm text-gray-600">{formatPrice(coupon.min_order)}</td>
                            <td className="px-4 py-3 font-body text-sm text-gray-600">{coupon.used_count}/{coupon.max_uses}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full font-body text-xs font-semibold ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {coupon.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-body text-sm text-gray-500">
                              {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-IN') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {coupons.length === 0 && (
                      <div className="text-center py-10">
                        <p className="font-body text-gray-400 text-sm">No coupons found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-display text-2xl font-bold text-maroon-900 mb-6">Orders ({orders.length})</h2>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ivory-100">
                        <tr>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-right px-4 py-3 font-body text-xs text-gray-500 uppercase tracking-wider">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ivory-300">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-ivory-100/50 transition-colors">
                            <td className="px-4 py-3 font-body text-sm font-semibold text-maroon-900">#{order.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-body text-sm text-maroon-900 font-medium">{order.user_name || '-'}</p>
                              <p className="font-body text-xs text-gray-500">{order.user_email || ''}</p>
                            </td>
                            <td className="px-4 py-3 font-body text-sm font-semibold text-maroon-900">{formatPrice(order.total)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full font-body text-xs font-semibold capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-body text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className="px-3 py-1.5 border border-ivory-300 rounded-lg font-body text-xs focus:outline-none focus:border-gold-500 transition-all cursor-pointer"
                              >
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="text-center py-10">
                        <p className="font-body text-gray-400 text-sm">No orders found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
