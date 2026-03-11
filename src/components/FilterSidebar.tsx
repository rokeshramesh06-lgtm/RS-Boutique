'use client';

import { useEffect } from 'react';

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

const genderOptions = ['All', 'Men', 'Women'];

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
  selectedGender,
  priceRange,
  maxPrice,
  onCategoryChange,
  onGenderChange,
  onPriceRangeChange,
  onReset,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  // Prevent body scroll on mobile when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const hasActiveFilters =
    selectedCategory !== '' ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const filterContent = (
    <div className="flex flex-col gap-8">
      {/* Header - mobile only */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="font-display text-xl font-semibold text-maroon-900">
          Filters
        </h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-maroon-900/70 transition-colors hover:bg-ivory-200"
          aria-label="Close filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h2 className="font-display text-xl font-semibold text-maroon-900">
          Refine Selection
        </h2>
        <div className="mt-1 h-px w-16 bg-gold-500/60" />
      </div>

      {/* Categories Filter */}
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-maroon-900">
          Category
        </h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={`rounded-lg px-4 py-2.5 text-left font-body text-sm transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-gold-500/15 font-medium text-maroon-900 border-l-2 border-gold-500'
                : 'text-[#6B6B6B] hover:bg-ivory-200 hover:text-maroon-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`rounded-lg px-4 py-2.5 text-left font-body text-sm transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gold-500/15 font-medium text-maroon-900 border-l-2 border-gold-500'
                  : 'text-[#6B6B6B] hover:bg-ivory-200 hover:text-maroon-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-maroon-900">
          Price Range
        </h3>
        <div className="space-y-4">
          {/* Current Range Display */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-medium text-maroon-900">
              {formatPrice(priceRange[0])}
            </span>
            <span className="mx-2 text-[#6B6B6B]">—</span>
            <span className="font-body text-sm font-medium text-maroon-900">
              {formatPrice(priceRange[1])}
            </span>
          </div>

          {/* Min Slider */}
          <div>
            <label className="mb-1 block font-body text-xs text-[#6B6B6B]">
              Minimum
            </label>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={100}
              value={priceRange[0]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= priceRange[1]) {
                  onPriceRangeChange([val, priceRange[1]]);
                }
              }}
              className="w-full"
            />
          </div>

          {/* Max Slider */}
          <div>
            <label className="mb-1 block font-body text-xs text-[#6B6B6B]">
              Maximum
            </label>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={100}
              value={priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= priceRange[0]) {
                  onPriceRangeChange([priceRange[0], val]);
                }
              }}
              className="w-full"
            />
          </div>

          {/* Quick Price Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: 'Under 1K', range: [0, 1000] as [number, number] },
              { label: '1K - 5K', range: [1000, 5000] as [number, number] },
              { label: '5K - 10K', range: [5000, 10000] as [number, number] },
              { label: '10K+', range: [10000, maxPrice] as [number, number] },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => onPriceRangeChange(preset.range)}
                className={`rounded-full border px-3 py-1.5 font-body text-xs transition-all ${
                  priceRange[0] === preset.range[0] &&
                  priceRange[1] === preset.range[1]
                    ? 'border-gold-500 bg-gold-500/10 text-maroon-900'
                    : 'border-ivory-300 text-[#6B6B6B] hover:border-gold-400 hover:text-maroon-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-lg border border-maroon-200 py-2.5 font-body text-sm font-medium text-maroon-800 transition-all hover:border-maroon-800 hover:bg-maroon-900 hover:text-ivory-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
            />
          </svg>
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-maroon-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Slide-in Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-ivory-100 shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto px-6 py-6 hide-scrollbar">
            {filterContent}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-[90px] rounded-xl border border-ivory-300/50 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          {filterContent}
        </div>
      </aside>
    </>
  );
}
