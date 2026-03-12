'use client';

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';

const CATEGORIES = ['Sarees', 'Churidar', 'Nighty'];

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  '': '/saree-backdrop.jpeg',
  'Sarees': '/saree-backdrop.jpeg',
  'Churidar': '/churidar-backdrop.jpeg',
  'Nighty': '/nighty-backdrop.jpeg',
};

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [maxPrice] = useState(100000);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  // Background crossfade state
  const [currentBg, setCurrentBg] = useState(CATEGORY_BACKGROUNDS[selectedCategory] || CATEGORY_BACKGROUNDS['']);
  const [nextBg, setNextBg] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  // Auto-cycle backgrounds when no category selected
  const cycleIndex = useRef(0);
  const cycleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      if (cycleTimer.current) clearInterval(cycleTimer.current);
      const target = CATEGORY_BACKGROUNDS[selectedCategory];
      if (target !== currentBg) {
        setNextBg(target);
        setTransitioning(true);
        const timer = setTimeout(() => {
          setCurrentBg(target);
          setNextBg('');
          setTransitioning(false);
        }, 700);
        return () => clearTimeout(timer);
      }
    } else {
      const allBgs = ['/saree-backdrop.jpeg', '/churidar-backdrop.jpeg', '/nighty-backdrop.jpeg'];
      cycleIndex.current = 0;
      setCurrentBg(allBgs[0]);

      cycleTimer.current = setInterval(() => {
        cycleIndex.current = (cycleIndex.current + 1) % allBgs.length;
        const target = allBgs[cycleIndex.current];
        setNextBg(target);
        setTransitioning(true);
        setTimeout(() => {
          setCurrentBg(target);
          setNextBg('');
          setTransitioning(false);
        }, 700);
      }, 5000);

      return () => {
        if (cycleTimer.current) clearInterval(cycleTimer.current);
      };
    }
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state when URL search params change
  useEffect(() => {
    const paramCategory = searchParams.get('category') || '';
    const paramSearch = searchParams.get('search') || '';
    setSelectedCategory(paramCategory);
    setSearch(paramSearch);
    setSearchInput(paramSearch);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedGender) params.set('gender', selectedGender);
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
      if (priceRange[1] < maxPrice) params.set('maxPrice', priceRange[1].toString());
      if (sort) params.set('sort', sort);
      if (search) params.set('search', search);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedGender, priceRange, maxPrice, sort, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedGender('');
    setPriceRange([0, maxPrice]);
    setSearch('');
    setSearchInput('');
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Hero Header — pull up behind the transparent navbar */}
      <div className="relative h-[60vh] min-h-[420px] max-h-[640px] overflow-hidden -mt-[70px]">
        {/* Current background */}
        <Image
          src={currentBg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />

        {/* Next background (crossfade) */}
        {nextBg && (
          <Image
            src={nextBg}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover object-top transition-opacity duration-700 ease-in-out ${
              transitioning ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content — breadcrumb, title, subtitle only */}
        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-4 pt-[70px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-ivory-200/70 font-body text-sm mb-6">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gold-400">Shop</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-3">
            Our Collection
          </h1>
          <p className="font-body text-ivory-200/80 text-base md:text-lg max-w-xl">
            Discover the finest women&apos;s Indian fashion — sarees, churidars, and nightwear.
          </p>
        </div>
      </div>

      {/* Search & Controls Bar — below the hero */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-3 py-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search our collection..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-5 py-3 pl-12 bg-white border border-ivory-300 rounded-lg font-body text-sm text-maroon-900 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all placeholder:text-gray-400"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-lg font-body text-sm transition-all ${
                filterOpen
                  ? 'bg-maroon-900 text-white'
                  : 'bg-white border border-ivory-300 text-maroon-800 hover:border-maroon-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  filterOpen ? 'bg-gold-500 text-maroon-900' : 'bg-maroon-900 text-white'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 bg-white border border-ivory-300 rounded-lg font-body text-sm text-maroon-800 focus:outline-none focus:border-gold-500 transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Panel (collapsible) */}
        <FilterSidebar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          selectedGender={selectedGender}
          priceRange={priceRange}
          maxPrice={maxPrice}
          onCategoryChange={setSelectedCategory}
          onGenderChange={setSelectedGender}
          onPriceRangeChange={setPriceRange}
          onReset={handleReset}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        {/* Product Count + Active Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <p className="font-body text-sm text-gray-500">
            Showing <span className="font-semibold text-maroon-900">{products.length}</span> products
          </p>
          {(selectedCategory || search) && (
            <>
              <span className="text-ivory-400">|</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="flex items-center gap-1 px-3 py-1 bg-maroon-900/10 text-maroon-900 rounded-full font-body text-xs hover:bg-maroon-900/20 transition-colors"
                >
                  {selectedCategory}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {search && (
                <button
                  onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="flex items-center gap-1 px-3 py-1 bg-maroon-900/10 text-maroon-900 rounded-full font-body text-xs hover:bg-maroon-900/20 transition-colors"
                >
                  &ldquo;{search}&rdquo;
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleReset}
                className="text-gold-600 font-body text-xs underline hover:text-gold-700"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Products Grid */}
        <div className="pb-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-ivory-300" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-ivory-300 rounded w-2/3" />
                    <div className="h-3 bg-ivory-300 rounded w-1/2" />
                    <div className="h-5 bg-ivory-300 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-20 h-20 text-ivory-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-display text-2xl text-maroon-900 mb-2">No products found</h3>
              <p className="font-body text-gray-500 mb-6">Try adjusting your filters or search term.</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-maroon-900 text-white font-body text-sm rounded-lg hover:bg-maroon-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-900" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
