import React, { useState, useMemo } from 'react';
import { ProductCategory, Product } from '../types';
import { useShop } from '../context/ShopContext';
import { db } from '../services/api';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, X, Star } from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'All', 'Laptops & Computers', 'Mobile Phones', 'Audio & Headphones',
  'TVs & Displays', 'Printers & Scanners', 'Accessories', 'Home Electronics',
];

export const ProductGrid: React.FC = () => {
  const { dbVersion } = useShop();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<'all' | 'under-2k' | '2k-10k' | 'above-10k'>('all');

  // Fetch products from simulated MongoDB layer (FR4, FR5)
  const products = useMemo(() => {
    void dbVersion;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceRange === 'under-2k') {
      maxPrice = 2000;
    } else if (priceRange === '2k-10k') {
      minPrice = 2000;
      maxPrice = 10000;
    } else if (priceRange === 'above-10k') {
      minPrice = 10000;
    }

    return db.getProducts({
      category: selectedCategory,
      search: searchQuery,
      minPrice,
      maxPrice,
      rating: minRating,
      inStockOnly,
      sort: sortBy,
    });
  }, [selectedCategory, searchQuery, inStockOnly, sortBy, minRating, priceRange, dbVersion]);

  return (
    <section id="catalog-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category Tabs & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        {/* Interactive Segmented Category Filter (FR4) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-100 text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls (FR5) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Sub-Filters Row: Price Range (INR), Rating, In Stock (FR5) */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-850">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-500 font-mono text-[11px] mr-1">Price (₹):</span>
          <button
            onClick={() => setPriceRange('all')}
            className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
              priceRange === 'all'
                ? 'bg-neutral-800 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Prices
          </button>
          <button
            onClick={() => setPriceRange('under-2k')}
            className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
              priceRange === 'under-2k'
                ? 'bg-neutral-800 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Under ₹2,000
          </button>
          <button
            onClick={() => setPriceRange('2k-10k')}
            className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
              priceRange === '2k-10k'
                ? 'bg-neutral-800 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ₹2,000 – ₹10,000
          </button>
          <button
            onClick={() => setPriceRange('above-10k')}
            className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
              priceRange === 'above-10k'
                ? 'bg-neutral-800 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Above ₹10,000
          </button>

          <span className="text-neutral-600 mx-1">|</span>

          {/* Rating Filter */}
          <button
            onClick={() => setMinRating(minRating === 4.8 ? 0 : 4.8)}
            className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors flex items-center gap-1 ${
              minRating > 0
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>4.8★ & Above</span>
          </button>

          {/* In-Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-2.5 py-1 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              inStockOnly
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>In Stock Only</span>
            {inStockOnly && <span className="font-bold">✓</span>}
          </button>
        </div>

        <div className="text-neutral-400 font-mono text-[11px]">
          Showing <span className="text-white font-bold">{products.length}</span> products
        </div>
      </div>

      {/* Product Cards 3-Column Grid */}
      <div className="pt-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
            <p className="text-neutral-400 text-sm mb-3">No products match your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setPriceRange('all');
                setMinRating(0);
                setInStockOnly(false);
              }}
              className="px-4 py-2 text-xs font-medium text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-400/10 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
