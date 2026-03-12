'use client';

import { useEffect, useRef } from 'react';

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  selectedGender: string;
  priceRange: [number, number];
  maxPrice: number;
  onCategoryChange: (category: string) => void;
  onGenderChange: (gender: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  priceRange,
  maxPrice,
  onCategoryChange,
  onPriceRangeChange,
  onReset,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    selectedCategory !== '' ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const activeCount =
    (selectedCategory ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // Close on click outside (desktop dropdown)
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay listener so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll on mobile when open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile: full-screen overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-maroon-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-ivory-100 shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto px-6 py-6 hide-scrollbar">
            {/* Mobile header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-maroon-900">Filters</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-maroon-900/70 hover:bg-ivory-200 transition-colors"
                aria-label="Close filters"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterContent
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              maxPrice={maxPrice}
              onCategoryChange={onCategoryChange}
              onPriceRangeChange={onPriceRangeChange}
              onReset={onReset}
              hasActiveFilters={hasActiveFilters}
              activeCount={activeCount}
              onClose={onClose}
              layout="mobile"
            />
          </div>
        </div>
      </div>

      {/* Desktop: dropdown panel */}
      <div
        ref={panelRef}
        className={`hidden md:block overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? 'max-h-[500px] opacity-100 mb-6'
            : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="rounded-xl border border-ivory-300/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <FilterContent
            categories={categories}
            selectedCategory={selectedCategory}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onCategoryChange={onCategoryChange}
            onPriceRangeChange={onPriceRangeChange}
            onReset={onReset}
            hasActiveFilters={hasActiveFilters}
            activeCount={activeCount}
            onClose={onClose}
            layout="desktop"
          />
        </div>
      </div>
    </>
  );
}

function FilterContent({
  categories,
  selectedCategory,
  priceRange,
  maxPrice,
  onCategoryChange,
  onPriceRangeChange,
  onReset,
  hasActiveFilters,
  activeCount,
  onClose,
  layout,
}: {
  categories: string[];
  selectedCategory: string;
  priceRange: [number, number];
  maxPrice: number;
  onCategoryChange: (c: string) => void;
  onPriceRangeChange: (r: [number, number]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activeCount: number;
  onClose: () => void;
  layout: 'mobile' | 'desktop';
}) {
  const isDesktop = layout === 'desktop';

  return (
    <div className={isDesktop ? 'flex gap-10 items-start' : 'flex flex-col gap-8'}>
      {/* Category */}
      <div className={isDesktop ? 'flex-1' : ''}>
        <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-maroon-900/60">
          Category
        </h3>
        <div className={isDesktop ? 'flex flex-wrap gap-2' : 'flex flex-col gap-1.5'}>
          <button
            onClick={() => { onCategoryChange(''); if (!isDesktop) onClose(); }}
            className={`rounded-full px-4 py-2 font-body text-sm transition-all duration-200 ${
              isDesktop ? '' : 'text-left'
            } ${
              selectedCategory === ''
                ? 'bg-maroon-900 text-white shadow-sm'
                : 'bg-ivory-200/60 text-maroon-800/70 hover:bg-ivory-300 hover:text-maroon-900'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { onCategoryChange(category); if (!isDesktop) onClose(); }}
              className={`rounded-full px-4 py-2 font-body text-sm transition-all duration-200 ${
                isDesktop ? '' : 'text-left'
              } ${
                selectedCategory === category
                  ? 'bg-maroon-900 text-white shadow-sm'
                  : 'bg-ivory-200/60 text-maroon-800/70 hover:bg-ivory-300 hover:text-maroon-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      {isDesktop ? (
        <div className="w-px self-stretch bg-ivory-300/60" />
      ) : (
        <div className="h-px bg-ivory-300/60" />
      )}

      {/* Price Range */}
      <div className={isDesktop ? 'flex-1 max-w-sm' : ''}>
        <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-maroon-900/60">
          Price Range
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-medium text-maroon-900">
              {formatPrice(priceRange[0])}
            </span>
            <span className="mx-2 text-ivory-400">—</span>
            <span className="font-body text-sm font-medium text-maroon-900">
              {formatPrice(priceRange[1])}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={100}
              value={priceRange[0]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= priceRange[1]) onPriceRangeChange([val, priceRange[1]]);
              }}
              className="w-full"
            />
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={100}
              value={priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= priceRange[0]) onPriceRangeChange([priceRange[0], val]);
              }}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Under 1K', range: [0, 1000] as [number, number] },
              { label: '1K – 5K', range: [1000, 5000] as [number, number] },
              { label: '5K – 10K', range: [5000, 10000] as [number, number] },
              { label: '10K+', range: [10000, maxPrice] as [number, number] },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => onPriceRangeChange(preset.range)}
                className={`rounded-full border px-3 py-1.5 font-body text-xs transition-all ${
                  priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1]
                    ? 'border-gold-500 bg-gold-500/10 text-maroon-900 font-medium'
                    : 'border-ivory-300 text-maroon-800/50 hover:border-gold-400 hover:text-maroon-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset / Apply */}
      {hasActiveFilters && (
        <>
          {isDesktop ? (
            <div className="flex items-center gap-3 self-end">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm text-maroon-800/60 hover:text-maroon-900 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Reset{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
            </div>
          ) : (
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 rounded-lg border border-maroon-200 py-2.5 font-body text-sm font-medium text-maroon-800 transition-all hover:border-maroon-800 hover:bg-maroon-900 hover:text-ivory-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Reset All Filters
            </button>
          )}
        </>
      )}
    </div>
  );
}
