'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const formatPrice = (price: number) => '₹' + price.toLocaleString('en-IN');

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('details');

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data.product);
        const sizes = data.product.sizes?.split(',').map((s: string) => s.trim()).filter(Boolean);
        const colors = data.product.colors?.split(',').map((c: string) => c.trim()).filter(Boolean);
        if (sizes?.length) setSelectedSize(sizes[0]);
        if (colors?.length) setSelectedColor(colors[0]);
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const sizes = product?.sizes?.split(',').map((s) => s.trim()).filter(Boolean) || [];
  const colors = product?.colors?.split(',').map((c) => c.trim()).filter(Boolean) || [];
  const discount = product ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-ivory-300 rounded-xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-4 bg-ivory-300 rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-ivory-300 rounded w-3/4 animate-pulse" />
              <div className="h-8 bg-ivory-300 rounded w-1/3 animate-pulse" />
              <div className="h-20 bg-ivory-300 rounded animate-pulse" />
              <div className="h-12 bg-ivory-300 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl text-maroon-900 mb-4">Product Not Found</h2>
          <p className="font-body text-gray-500 mb-6">The product you are looking for does not exist.</p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-maroon-900 text-white font-body text-sm rounded-lg hover:bg-maroon-800 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-body text-gray-500">
          <Link href="/" className="hover:text-maroon-900 transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/shop" className="hover:text-maroon-900 transition-colors">Shop</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-maroon-900">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Area */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden relative bg-ivory-200">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: product.image_gradient }}
                />
              )}

              {/* Category badge */}
              <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                <span className="font-body text-maroon-900 text-xs font-semibold tracking-wider uppercase">{product.category}</span>
              </div>

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="font-body text-maroon-900 text-xs font-bold">-{discount}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Gender tag */}
            <span className="inline-block w-fit px-3 py-1 bg-maroon-900/10 text-maroon-900 font-body text-xs tracking-wider uppercase rounded-full mb-3">
              {product.gender}
            </span>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-maroon-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-maroon-900">{formatPrice(product.price)}</span>
              {product.original_price > product.price && (
                <>
                  <span className="font-body text-lg text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 font-body text-xs font-semibold rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="font-body text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Divider */}
            <div className="w-full h-[1px] bg-ivory-300 mb-6" />

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <label className="font-body text-sm font-semibold text-maroon-900 mb-3 block">
                  Size: <span className="font-normal text-gray-500">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-4 py-2.5 rounded-lg font-body text-sm transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-maroon-900 text-white shadow-md'
                          : 'bg-white border border-ivory-300 text-gray-700 hover:border-maroon-900/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="mb-6">
                <label className="font-body text-sm font-semibold text-maroon-900 mb-3 block">
                  Color: <span className="font-normal text-gray-500">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gold-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <svg className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {getColorHex(color) === '#FFFFFF' || getColorHex(color) === '#FFFDD0' || getColorHex(color) === '#F5F5DC' || getColorHex(color) === '#FFFFF0' ? (
                        <span className={`absolute inset-0 rounded-full border border-gray-300 ${selectedColor === color ? '' : ''}`} />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="font-body text-sm font-semibold text-maroon-900 mb-3 block">Quantity</label>
              <div className="inline-flex items-center border border-ivory-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-maroon-900 hover:bg-ivory-200 transition-colors font-body font-semibold"
                >
                  -
                </button>
                <span className="px-6 py-2.5 font-body text-sm font-semibold border-x border-ivory-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-maroon-900 hover:bg-ivory-200 transition-colors font-body font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className={`w-full py-4 rounded-lg font-body font-semibold text-base tracking-wide uppercase transition-all duration-300 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-gold-500 text-maroon-900 hover:bg-gold-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {addedToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </span>
              )}
            </button>

            {/* Product Details Accordion */}
            <div className="mt-8 space-y-0 border border-ivory-300 rounded-lg overflow-hidden">
              {/* Fabric & Details */}
              <div className="border-b border-ivory-300 last:border-b-0">
                <button
                  onClick={() => setOpenSection(openSection === 'details' ? null : 'details')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-ivory-100 transition-colors"
                >
                  <span className="font-body text-sm font-semibold text-maroon-900">Product Details</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSection === 'details' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === 'details' && (
                  <div className="px-5 pb-4 bg-white font-body text-sm text-gray-600 leading-relaxed">
                    <ul className="space-y-2">
                      <li className="flex gap-2"><span className="text-maroon-900 font-medium">Fabric:</span> Premium quality blend, chosen for comfort and elegance</li>
                      <li className="flex gap-2"><span className="text-maroon-900 font-medium">Work:</span> Intricate handcrafted embroidery with traditional motifs</li>
                      <li className="flex gap-2"><span className="text-maroon-900 font-medium">Occasion:</span> Wedding, Festive, Party, Casual</li>
                      <li className="flex gap-2"><span className="text-maroon-900 font-medium">Pattern:</span> Heritage design inspired by Indian artistry</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              <div className="border-b border-ivory-300 last:border-b-0">
                <button
                  onClick={() => setOpenSection(openSection === 'care' ? null : 'care')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-ivory-100 transition-colors"
                >
                  <span className="font-body text-sm font-semibold text-maroon-900">Care Instructions</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSection === 'care' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === 'care' && (
                  <div className="px-5 pb-4 bg-white font-body text-sm text-gray-600 leading-relaxed">
                    <ul className="space-y-2">
                      <li>Dry clean recommended for best results</li>
                      <li>If hand washing, use cold water with mild detergent</li>
                      <li>Do not bleach or wring</li>
                      <li>Iron on low heat on the reverse side</li>
                      <li>Store in a cool, dry place away from direct sunlight</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div>
                <button
                  onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-ivory-100 transition-colors"
                >
                  <span className="font-body text-sm font-semibold text-maroon-900">Shipping Information</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSection === 'shipping' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === 'shipping' && (
                  <div className="px-5 pb-4 bg-white font-body text-sm text-gray-600 leading-relaxed">
                    <ul className="space-y-2">
                      <li>Free shipping on orders above {formatPrice(2999)}</li>
                      <li>Standard delivery: 5-7 business days</li>
                      <li>Express delivery: 2-3 business days (additional charges apply)</li>
                      <li>We ship across India and select international destinations</li>
                      <li>15-day easy return policy</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Back to Shop */}
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 font-body text-sm text-maroon-900 hover:text-gold-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
