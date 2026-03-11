'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const formatPrice = (price: number) => '₹' + price.toLocaleString('en-IN');

interface ShippingForm {
  fullName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pinCode: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart, itemCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiId, setUpiId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = total;
  const finalTotal = subtotal - discount;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  // Redirect if cart is empty and order not placed
  useEffect(() => {
    if (!authLoading && user && items.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [items, authLoading, user, orderPlaced, router]);

  const handleShippingChange = (field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

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
      } else {
        setDiscount(data.discount || 0);
        setCouponSuccess(`Coupon applied! You save ${formatPrice(data.discount)}`);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const validateForm = () => {
    if (!shipping.fullName.trim()) return 'Full name is required';
    if (!shipping.phone.trim() || shipping.phone.length < 10) return 'Valid phone number is required';
    if (!shipping.address1.trim()) return 'Address is required';
    if (!shipping.city.trim()) return 'City is required';
    if (!shipping.state.trim()) return 'State is required';
    if (!shipping.pinCode.trim() || shipping.pinCode.length < 6) return 'Valid PIN code is required';
    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) return 'Card number is required';
      if (!cardExpiry.trim()) return 'Card expiry is required';
      if (!cardCVV.trim()) return 'Card CVV is required';
    }
    if (paymentMethod === 'upi' && !upiId.trim()) return 'UPI ID is required';
    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPlacing(true);

    const shippingAddress = `${shipping.fullName}, ${shipping.phone}, ${shipping.address1}${shipping.address2 ? ', ' + shipping.address2 : ''}, ${shipping.city}, ${shipping.state} - ${shipping.pinCode}`;

    const paymentMethodLabel =
      paymentMethod === 'cod' ? 'Cash on Delivery' :
      paymentMethod === 'upi' ? `UPI (${upiId})` :
      'Credit/Debit Card';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.product.price,
          })),
          shippingAddress,
          paymentMethod: paymentMethodLabel,
          couponCode: couponCode.trim() || null,
          subtotal,
          discount,
          total: finalTotal > 0 ? finalTotal : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderId(data.order?.id || data.orderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-900" />
      </div>
    );
  }

  if (!user) return null;

  // Order Confirmation
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-bold text-maroon-900 mb-2">Order Placed!</h1>
          <p className="font-body text-gray-500 mb-6">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          {orderId && (
            <div className="bg-ivory-100 rounded-lg p-4 mb-6">
              <p className="font-body text-sm text-gray-500">Order ID</p>
              <p className="font-display text-2xl font-bold text-maroon-900">#{orderId}</p>
            </div>
          )}

          <p className="font-body text-sm text-gray-500 mb-8">
            We have sent a confirmation to your email. You can track your order in &quot;My Orders&quot;.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="px-6 py-3 bg-maroon-900 text-white font-body font-semibold text-sm rounded-lg hover:bg-maroon-800 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 border-2 border-maroon-900 text-maroon-900 font-body font-semibold text-sm rounded-lg hover:bg-maroon-900 hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-ivory-200/60 font-body text-sm mb-3">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/cart" className="hover:text-gold-400 transition-colors">Cart</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gold-400">Checkout</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-maroon-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-maroon-900 text-white rounded-full flex items-center justify-center font-body text-sm font-semibold">1</span>
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
                    <input
                      type="text"
                      value={shipping.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Phone Number *</label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shipping.address1}
                      onChange={(e) => handleShippingChange('address1', e.target.value)}
                      placeholder="House no., Street, Area"
                      className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Address Line 2</label>
                    <input
                      type="text"
                      value={shipping.address2}
                      onChange={(e) => handleShippingChange('address2', e.target.value)}
                      placeholder="Landmark, Colony (optional)"
                      className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">State *</label>
                      <input
                        type="text"
                        value={shipping.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">PIN Code *</label>
                      <input
                        type="text"
                        value={shipping.pinCode}
                        onChange={(e) => handleShippingChange('pinCode', e.target.value)}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-maroon-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-maroon-900 text-white rounded-full flex items-center justify-center font-body text-sm font-semibold">2</span>
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-gold-500 bg-gold-50' : 'border-ivory-300 hover:border-gold-500/50'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-maroon-900"
                    />
                    <div className="flex-1">
                      <p className="font-body font-semibold text-maroon-900 text-sm">Cash on Delivery</p>
                      <p className="font-body text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                    <svg className="w-6 h-6 text-maroon-900/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </label>

                  {/* UPI */}
                  <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-gold-500 bg-gold-50' : 'border-ivory-300 hover:border-gold-500/50'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-maroon-900"
                    />
                    <div className="flex-1">
                      <p className="font-body font-semibold text-maroon-900 text-sm">UPI Payment</p>
                      <p className="font-body text-xs text-gray-500">Pay via UPI apps like Google Pay, PhonePe</p>
                    </div>
                    <svg className="w-6 h-6 text-maroon-900/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </label>

                  {paymentMethod === 'upi' && (
                    <div className="ml-9 mt-2 p-4 bg-ivory-100 rounded-lg">
                      <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">UPI ID *</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all bg-white"
                      />
                    </div>
                  )}

                  {/* Card */}
                  <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-gold-500 bg-gold-50' : 'border-ivory-300 hover:border-gold-500/50'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-maroon-900"
                    />
                    <div className="flex-1">
                      <p className="font-body font-semibold text-maroon-900 text-sm">Credit/Debit Card</p>
                      <p className="font-body text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                    </div>
                    <svg className="w-6 h-6 text-maroon-900/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </label>

                  {paymentMethod === 'card' && (
                    <div className="ml-9 mt-2 p-4 bg-ivory-100 rounded-lg space-y-3">
                      <div>
                        <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Card Number *</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={19}
                          className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">Expiry *</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-body text-sm font-medium text-gray-700 mb-1.5 block">CVV *</label>
                          <input
                            type="password"
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            placeholder="XXX"
                            maxLength={4}
                            className="w-full px-4 py-3 border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h2 className="font-display text-2xl font-bold text-maroon-900 mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${item.product.image_gradient.replace(' to ', ', ')})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-maroon-900 font-medium truncate">{item.product.name}</p>
                        <p className="font-body text-xs text-gray-500">{item.size} / {item.color} x {item.quantity}</p>
                      </div>
                      <p className="font-body text-sm font-semibold text-maroon-900 flex-shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ivory-300 pt-4 space-y-2">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                    <span className="text-maroon-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600">{subtotal >= 2999 ? 'Free' : formatPrice(199)}</span>
                  </div>

                  {/* Coupon */}
                  {!couponSuccess && (
                    <div className="pt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 border border-ivory-300 rounded-lg font-body text-xs focus:outline-none focus:border-gold-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="px-3 py-2 bg-maroon-900 text-white font-body text-xs rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className="font-body text-xs text-red-500 mt-1">{couponError}</p>}
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-ivory-300">
                  <span className="font-display text-lg font-bold text-maroon-900">Total</span>
                  <span className="font-display text-2xl font-bold text-maroon-900">
                    {formatPrice(finalTotal > 0 ? finalTotal : 0)}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-body text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={placing}
                  className="w-full mt-6 py-4 bg-gold-500 text-maroon-900 font-body font-semibold text-sm tracking-wide uppercase rounded-lg hover:bg-gold-400 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-maroon-900/30 border-t-maroon-900 rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>

                {/* Secure badge */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-body text-xs text-gray-400">Your payment information is secure</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
