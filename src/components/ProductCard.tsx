'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const discount =
    product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) *
            100
        )
      : 0;

  const sizes = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : [];
  const colors = product.colors ? product.colors.split(',').map((c) => c.trim()) : [];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstSize = sizes[0] || 'Free Size';
    const firstColor = colors[0] || 'Default';
    addToCart(product, firstSize, firstColor, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-maroon-900/10">
        {/* Image Area */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* Product Image */}
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ background: product.image_gradient }}
              />
              <div className="pattern-overlay absolute inset-0 opacity-60" />
            </>
          )}

          {/* Subtle Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Category Badge */}
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-block rounded-full bg-white/90 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-maroon-900 shadow-sm backdrop-blur-sm">
              {product.category}
            </span>
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute right-3 top-3 z-10">
              <span className="inline-flex items-center rounded-full bg-maroon-800 px-2.5 py-1 font-body text-[10px] font-bold text-white shadow-sm">
                -{discount}%
              </span>
            </div>
          )}

          {/* Hover Overlay with Quick Add */}
          <div className="absolute inset-0 flex items-end justify-center bg-maroon-900/0 pb-16 transition-all duration-500 group-hover:bg-maroon-900/20">
            <button
              onClick={handleQuickAdd}
              className="translate-y-4 rounded-lg bg-white/95 px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-maroon-900 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gold-500 hover:text-maroon-950 group-hover:translate-y-0 group-hover:opacity-100"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-display text-lg font-semibold leading-tight text-maroon-900 transition-colors group-hover:text-maroon-800">
            {product.name}
          </h3>

          {/* Price Row */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-body text-lg font-semibold text-maroon-900">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <span className="font-body text-sm text-[#6B6B6B] line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Out of stock indicator */}
          {product.in_stock === 0 && (
            <p className="mt-1.5 font-body text-xs font-medium text-maroon-600">
              Out of Stock
            </p>
          )}

          {/* View Details Link */}
          <div className="mt-3 flex items-center gap-1 font-body text-xs font-medium uppercase tracking-wider text-gold-600 transition-colors group-hover:text-gold-500">
            <span>View Details</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
