import React, { useState } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Plus, Eye, Check, AlertCircle, Laptop, Smartphone, Headphones, Tv, Printer, Cable, Microwave, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setQuickViewProduct } = useShop();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const categoryIcon = product.category === 'Laptops & Computers' ? Laptop : product.category === 'Mobile Phones' ? Smartphone : product.category === 'Audio & Headphones' ? Headphones : product.category === 'TVs & Displays' ? Tv : product.category === 'Printers & Scanners' ? Printer : product.category === 'Accessories' ? Cable : product.category === 'Home Electronics' ? Microwave : Package;
  const CategoryIcon = categoryIcon;
  const isOutOfStock = product.inventoryCount <= 0;
  const isLowStock = product.inventoryCount > 0 && product.inventoryCount <= product.lowStockThreshold;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div
      onClick={() => setQuickViewProduct(product)}
      className="group flex flex-col justify-between rounded-xl bg-neutral-900/70 border border-neutral-800/80 overflow-hidden hover:border-neutral-700 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/3 w-full bg-neutral-950 overflow-hidden">
        {!imageError && product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} onError={() => setImageError(true)} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-900 via-neutral-950 to-[#17140d] text-amber-300">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6"><CategoryIcon className="w-14 h-14 stroke-[1.25]" /></div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">{product.category}</span>
          </div>
        )}

        {/* Hover Quick Action Layer */}
        <div className="absolute inset-0 bg-neutral-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="p-2.5 rounded-full bg-neutral-900/90 text-neutral-200 hover:text-white hover:bg-neutral-800 backdrop-blur-sm border border-neutral-700 transition-all shadow-lg hover:scale-105 cursor-pointer"
            title="Inspect Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold tracking-wide transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-1.5"
              title="Add to Shopping Bag"
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Quiet Inventory Notice (No garish pills) */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 text-neutral-400 text-[11px] font-mono px-2 py-0.5 rounded">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 left-3 bg-amber-950/80 backdrop-blur-sm border border-amber-800/60 text-amber-300 text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Only {product.inventoryCount} left</span>
          </div>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand Metadata */}
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-2">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          {/* Product Name & Rating */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-medium text-neutral-100 group-hover:text-amber-200 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 shrink-0">
              <span>★</span>
              <span>{product.rating}</span>
            </div>
          </div>

          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing in INR and Stock Footer */}
        <div className="pt-4 mt-2 border-t border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-white font-mono tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-neutral-500 line-through font-mono tabular-nums">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-neutral-400">
            {isOutOfStock ? (
              <span className="text-rose-400">Sold Out</span>
            ) : (
              <span className="text-neutral-400">Stock: {product.inventoryCount}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
