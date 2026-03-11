'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

const formatPrice = (price: number) => '₹' + price.toLocaleString('en-IN');

const FEATURED_CATEGORIES = [
  {
    name: 'Sarees',
    desc: 'Timeless drapes of elegance',
    image: 'https://images.pexels.com/photos/28943572/pexels-photo-28943572.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Churidar',
    desc: 'Graceful ethnic charm',
    image: 'https://images.pexels.com/photos/1149962/pexels-photo-1149962.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Nighty',
    desc: 'Comfort meets elegance',
    image: 'https://images.pexels.com/photos/8640026/pexels-photo-8640026.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Mumbai',
    text: 'The Banarasi saree I purchased was absolutely breathtaking. The craftsmanship and attention to detail truly set RS Boutique apart from any other store I have shopped at.',
    rating: 5,
  },
  {
    name: 'Ananya Iyer',
    city: 'Chennai',
    text: 'The churidar sets are gorgeous and so comfortable! I ordered three different designs and each one fits perfectly. The fabric quality is outstanding for the price.',
    rating: 5,
  },
  {
    name: 'Kavitha Reddy',
    city: 'Hyderabad',
    text: 'RS Boutique has become my go-to for all occasions. Their nightwear collection is so soft and luxurious. The customer service is warm and personal. Highly recommended!',
    rating: 5,
  },
];

function useIntersectionObserver(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const features = useIntersectionObserver();
  const categories = useIntersectionObserver();
  const products = useIntersectionObserver();
  const testimonials = useIntersectionObserver();
  const newsletter = useIntersectionObserver();

  useEffect(() => {
    // Seed database on first load
    fetch('/api/seed').catch(() => {});

    // Fetch featured products
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const featured = (data.products || []).filter((p: Product) => p.featured === 1);
        setFeaturedProducts(featured.length > 0 ? featured.slice(0, 8) : (data.products || []).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-50 via-white to-gold-50" />

        {/* Gold decorative overlay pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23C9A84C' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

        {/* Decorative corner ornaments */}
        <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-maroon-200" />
        <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-maroon-200" />
        <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-maroon-200" />
        <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-maroon-200" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-[fadeSlideUp_1s_ease-out]">
          {/* Ornamental top */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-gold-500" />
            <svg className="w-6 h-6 text-gold-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-gold-500" />
          </div>

          <p className="text-maroon-600 font-body text-sm tracking-[0.35em] uppercase mb-4">
            Premium Indian Fashion
          </p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-maroon-900 mb-4 leading-[0.9]">
            RS <span className="text-gold-500">Boutique</span>
          </h1>

          <p className="font-display text-2xl md:text-3xl text-maroon-600 italic mb-6">
            Where Tradition Meets Elegance
          </p>

          <p className="font-body text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover an exquisite collection of handcrafted Indian women&apos;s clothing,
            from timeless sarees and elegant churidars to luxurious nightwear.
            Each piece tells a story of heritage and femininity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="group relative px-10 py-4 bg-maroon-900 text-white font-body font-semibold text-base tracking-wide uppercase rounded-sm overflow-hidden transition-all duration-300 hover:bg-maroon-800 hover:shadow-[0_0_30px_rgba(201,168,76,0.3)]"
            >
              <span className="relative z-10">Shop Collection</span>
            </Link>
            <Link
              href="/shop?category=Sarees"
              className="group px-10 py-4 border-2 border-maroon-900 text-maroon-900 font-body font-semibold text-base tracking-wide uppercase rounded-sm transition-all duration-300 hover:bg-maroon-900/10 hover:border-maroon-800"
            >
              <span className="relative z-10">Explore Sarees</span>
            </Link>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-maroon-300" />
            <div className="w-2 h-2 rotate-45 border border-maroon-300" />
            <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-maroon-300" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-maroon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Bar */}
      <section
        ref={features.ref}
        className={`bg-maroon-50 border-y border-maroon-100 py-8 transition-all duration-700 ${features.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Free Shipping */}
            <div className="flex flex-col items-center text-center gap-3">
              <svg className="w-8 h-8 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div>
                <p className="font-body font-semibold text-maroon-900 text-sm">Free Shipping</p>
                <p className="font-body text-gray-500 text-xs mt-0.5">On orders over {formatPrice(2999)}</p>
              </div>
            </div>

            {/* Authentic Handcraft */}
            <div className="flex flex-col items-center text-center gap-3">
              <svg className="w-8 h-8 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <p className="font-body font-semibold text-maroon-900 text-sm">Authentic Handcraft</p>
                <p className="font-body text-gray-500 text-xs mt-0.5">Artisan-made pieces</p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex flex-col items-center text-center gap-3">
              <svg className="w-8 h-8 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              <div>
                <p className="font-body font-semibold text-maroon-900 text-sm">Easy Returns</p>
                <p className="font-body text-gray-500 text-xs mt-0.5">15-day return policy</p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex flex-col items-center text-center gap-3">
              <svg className="w-8 h-8 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-body font-semibold text-maroon-900 text-sm">Secure Payment</p>
                <p className="font-body text-gray-500 text-xs mt-0.5">100% protected checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section
        ref={categories.ref}
        className={`py-20 px-4 bg-white transition-all duration-700 delay-100 ${categories.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-14">
            <p className="text-maroon-400 font-body text-sm tracking-[0.25em] uppercase mb-3">Explore</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-maroon-900 mb-4">
              Our Collections
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-[1px] bg-maroon-300" />
              <svg className="w-4 h-4 text-maroon-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <div className="w-12 h-[1px] bg-maroon-300" />
            </div>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURED_CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.name}
                href={`/shop?category=${cat.name}`}
                className={`group relative h-72 rounded-lg overflow-hidden transition-all duration-500 delay-${idx * 100} ${categories.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

                {/* Decorative corner */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-white/30" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/30" />

                <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                  <h3 className="font-display text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {cat.name}
                  </h3>
                  <p className="font-body text-white/70 text-sm mb-4">{cat.desc}</p>
                  <span className="inline-flex items-center gap-2 text-white font-body text-sm tracking-wider uppercase group-hover:gap-3 transition-all duration-300">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        ref={products.ref}
        className={`py-20 px-4 bg-maroon-50/30 transition-all duration-700 delay-200 ${products.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-14">
            <p className="text-maroon-400 font-body text-sm tracking-[0.25em] uppercase mb-3">Handpicked For You</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-maroon-900 mb-4">
              Curated Collection
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-[1px] bg-maroon-300" />
              <svg className="w-4 h-4 text-maroon-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <div className="w-12 h-[1px] bg-maroon-300" />
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                  <div className="h-72 bg-ivory-300" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-ivory-300 rounded w-3/4" />
                    <div className="h-4 bg-ivory-300 rounded w-1/2" />
                    <div className="h-6 bg-ivory-300 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-maroon-900 text-maroon-900 font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-maroon-900 hover:text-white transition-all duration-300"
            >
              View All Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonials.ref}
        className={`py-20 px-4 bg-white transition-all duration-700 delay-300 ${testimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-14">
            <p className="text-maroon-400 font-body text-sm tracking-[0.25em] uppercase mb-3">Voices of Trust</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-maroon-900 mb-4">
              What Our Patrons Say
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-[1px] bg-maroon-300" />
              <svg className="w-4 h-4 text-maroon-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <div className="w-12 h-[1px] bg-maroon-300" />
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
              >
                {/* Quote mark */}
                <svg className="absolute top-6 right-6 w-10 h-10 text-maroon-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                </svg>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="font-body text-gray-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon-900 to-maroon-700 flex items-center justify-center">
                    <span className="text-white font-display font-bold text-lg">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-maroon-900 text-sm">{t.name}</p>
                    <p className="font-body text-gray-500 text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        ref={newsletter.ref}
        className={`py-20 px-4 relative overflow-hidden transition-all duration-700 delay-400 ${newsletter.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-50 via-rose-50 to-maroon-50" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-maroon-900 mb-3">
            Join the RS Boutique Family
          </h2>
          <p className="font-body text-gray-500 mb-8">
            Subscribe for exclusive previews, styling tips, and members-only offers on our finest collections.
          </p>

          {subscribed ? (
            <div className="bg-maroon-100 border border-maroon-200 rounded-lg p-6">
              <svg className="w-12 h-12 text-maroon-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-display text-xl text-maroon-900">Thank you for subscribing!</p>
              <p className="font-body text-gray-500 text-sm mt-1">Welcome to the RS Boutique family.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3.5 bg-white border border-maroon-200 rounded-sm text-maroon-900 placeholder-gray-400 font-body text-sm focus:outline-none focus:border-maroon-500 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-maroon-900 text-white font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-maroon-800 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
