'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';

const CATEGORIES = ['Sarees', 'Churidar', 'Nighty'];

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

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-ivory-200/60 font-body text-sm mb-4">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gold-400">Shop</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
            Our Collection
          </h1>
          <p className="font-body text-ivory-200/70 text-sm">
            Discover the finest women&apos;s Indian fashion — sarees, churidars, and nightwear.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search our collection..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-5 py-3 pl-12 bg-white border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
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
          </form>

          {/* Sort & Filter Toggle */}
          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 bg-white border border-ivory-300 rounded-lg font-body text-sm focus:outline-none focus:border-gold-500 transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-maroon-900 text-white rounded-lg font-body text-sm hover:bg-maroon-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || search) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="font-body text-sm text-gray-500">Active filters:</span>
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
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
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
              isOpen={true}
              onClose={() => {}}
            />
          </div>

          {/* Mobile Sidebar Overlay */}
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

          {/* Products Area */}
          <div className="flex-1">
            {/* Product Count */}
            <p className="font-body text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-maroon-900">{products.length}</span> products
            </p>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                    <div className="h-56 md:h-72 bg-ivory-300" />
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
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
