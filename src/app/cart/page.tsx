'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const formatPrice = (price: number) => '₹' + price.toLocaleString('en-IN');

const COLOR_MAP: Record<string, string> = {
  Red: '#DC2626', Maroon: '#6B0F1A', Gold: '#C9A84C', Green: '#16A34A',
  Blue: '#2563EB', Navy: '#1E3A5F', Pink: '#EC4899', Orange: '#EA580C',
  Purple: '#9333EA', White: '#FFFFFF', Black: '#1A1A1A', Cream: '#FFFDD0',
  Beige: '#F5F5DC', Yellow: '#EAB308', Teal: '#0D9488', Silver: '#C0C0C0',
  Peach: '#FFDAB9', Magenta: '#FF00FF', Turquoise: '#40E0D0', Ivory: '#FFFFF0',
  Rust: '#B7410E', Wine: '#722F37', Royal: '#4169E1', Emerald: '#50C878',
};

const getColorHex = (colorName: string) => {
  const key = Object.keys(COLOR_MAP).find((k) => colorName.toLowerCase().includes(k.toLowerCase()));
  return key ? COLOR_MAP[key] : '#888888';
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const subtotal = total;
  const finalTotal = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code');
        setDiscount(0);
        setAppliedCoupon('');
      } else {
        setDiscount(data.discount || 0);
        setAppliedCoupon(couponCode.trim());
        setCouponSuccess(`Coupon applied! You save ${formatPrice(data.discount)}`);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setAppliedCoupon('');
    setCouponError('');
    setCouponSuccess('');
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-maroon-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-maroon-900/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-maroon-900 mb-3">Your Bag is Empty</h1>
          <p className="font-body text-gray-500 mb-8">
            Looks like you have not added anything to your bag yet. Explore our exquisite collection and find something you love.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-maroon-700 text-white font-body font-semibold text-sm tracking-wide uppercase rounded-lg hover:bg-maroon-600 transition-colors"
          >
            Continue Shopping
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-maroon-50 via-white to-rose-50 border-b border-maroon-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-gray-400 font-body text-sm mb-3">
            <Link href="/" className="hover:text-maroon-700 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-maroon-700">Shopping Bag</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-maroon-900">
            Shopping Bag
          </h1>
          <p className="font-body text-gray-500 text-sm mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="bg-white rounded-xl p-4 md:p-6 shadow-sm flex gap-4 md:gap-6 items-start"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg flex-shrink-0 relative overflow-hidden">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: item.product.image_gradient }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.id}`} className="hover:text-gold-600 transition-colors">
                    <h3 className="font-display text-lg md:text-xl font-bold text-maroon-900 truncate">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 font-body text-sm text-gray-500">
                    <span>Size: <span className="text-maroon-900 font-medium">{item.size}</span></span>
                    <span className="flex items-center gap-1.5">
                      Color:
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: getColorHex(item.color) }}
                      />
                      <span className="text-maroon-900 font-medium">{item.color}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-ivory-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="px-3 py-1.5 text-maroon-900 hover:bg-ivory-200 transition-colors font-body text-sm font-semibold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 font-body text-sm font-semibold border-x border-ivory-300 min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="px-3 py-1.5 text-maroon-900 hover:bg-ivory-200 transition-colors font-body text-sm font-semibold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-display text-xl font-bold text-maroon-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-1"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-body text-sm text-maroon-900 hover:text-gold-600 transition-colors mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-display text-2xl font-bold text-maroon-900 mb-6">Order Summary</h2>

              {/* Subtotal */}
              <div className="flex justify-between font-body text-sm mb-3">
                <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                <span className="text-maroon-900 font-semibold">{formatPrice(subtotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between font-body text-sm mb-3">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-semibold">
                  {subtotal >= 2999 ? 'Free' : formatPrice(199)}
                </span>
              </div>

              {/* Coupon Code */}
              <div className="py-4 border-y border-ivory-300 my-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-green-700">{appliedCoupon}</p>
                      <p className="font-body text-xs text-green-600">-{formatPrice(discount)}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="font-body text-sm font-semibold text-maroon-900 mb-2 block">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2.5 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-colors"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 bg-maroon-700 text-white font-body text-sm font-semibold rounded-lg hover:bg-maroon-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="font-body text-xs text-red-500 mt-2">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="font-body text-xs text-green-600 mt-2">{couponSuccess}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between font-body text-sm mb-3">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600 font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-baseline pt-4 border-t border-ivory-300 mb-6">
                <span className="font-display text-lg font-bold text-maroon-900">Total</span>
                <span className="font-display text-2xl font-bold text-maroon-900">{formatPrice(finalTotal > 0 ? finalTotal : 0)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-maroon-900 text-white font-body font-semibold text-sm tracking-wide uppercase rounded-lg hover:bg-maroon-800 hover:shadow-lg transition-all duration-300"
              >
                Proceed to Checkout
              </button>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-body text-xs text-gray-400">Secure checkout powered by RS Boutique</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
