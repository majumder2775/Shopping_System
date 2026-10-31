import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { db, mernApi } from '../services/api';
import { X, Check, AlertCircle, ShieldCheck, Truck, Star, MessageSquarePlus, Laptop, Smartphone, Headphones, Tv, Printer, Cable, Microwave, Package } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, dbVersion, currentUser, showToast } = useShop();
  const [selectedQty, setSelectedQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Review form states (FR17)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const categoryIcon = quickViewProduct?.category === 'Laptops & Computers' ? Laptop : quickViewProduct?.category === 'Mobile Phones' ? Smartphone : quickViewProduct?.category === 'Audio & Headphones' ? Headphones : quickViewProduct?.category === 'TVs & Displays' ? Tv : quickViewProduct?.category === 'Printers & Scanners' ? Printer : quickViewProduct?.category === 'Accessories' ? Cable : quickViewProduct?.category === 'Home Electronics' ? Microwave : Package;
  const CategoryIcon = categoryIcon;

  if (!quickViewProduct) return null;

  void dbVersion;
  const liveProduct = db.getProductById(quickViewProduct._id) || quickViewProduct;
  const isOutOfStock = liveProduct.inventoryCount <= 0;
  const isLowStock = liveProduct.inventoryCount > 0 && liveProduct.inventoryCount <= liveProduct.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(liveProduct, selectedQty);
    if (success) {
      setQuickViewProduct(null);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await mernApi.addReview(
        liveProduct._id,
        currentUser?._id || 'guest_user',
        currentUser?.name || 'Customer',
        reviewRating,
        reviewComment
      );
      setReviewComment('');
      showToast('Review submitted and rating updated!');
    } catch (err: any) {
      showToast(`Error adding review: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Image Stage & Specifications */}
          <div className="md:col-span-6 bg-neutral-950 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/80">
              {liveProduct.images?.[0] ? (
                <img src={liveProduct.images[0]} alt={liveProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full min-h-48 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-neutral-900 to-[#17140d] text-amber-300">
                  <CategoryIcon className="w-20 h-20 stroke-[1.1]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{liveProduct.category}</span>
                </div>
              )}
            </div>

            {/* Micro specs below image */}
            <div className="mt-6 pt-4 border-t border-neutral-800/60 space-y-2 text-xs text-neutral-400 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">SKU Code</span>
                <span className="text-neutral-300">{liveProduct.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">MongoDB _id</span>
                <span className="text-amber-400/90 text-[10px] truncate max-w-[180px]">
                  {liveProduct._id}
                </span>
              </div>
              {liveProduct.materials && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Materials</span>
                  <span className="text-neutral-300 text-right">{liveProduct.materials}</span>
                </div>
              )}
              {liveProduct.dimensions && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dimensions</span>
                  <span className="text-neutral-300">{liveProduct.dimensions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module & Reviews (FR6, FR17) */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand, Category & Tab Switcher */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-3">
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                  <span>{liveProduct.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{liveProduct.category}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      activeTab === 'details' ? 'bg-neutral-800 text-amber-300 font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 ${
                      activeTab === 'reviews' ? 'bg-neutral-800 text-amber-300 font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Reviews</span>
                    <span className="font-mono text-[10px]">({liveProduct.reviewCount || 0})</span>
                  </button>
                </div>
              </div>

              {/* Title & Rating */}
              <h2 className="text-xl sm:text-2xl font-serif text-white leading-snug">
                {liveProduct.name}
              </h2>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <span>★</span>
                  <span className="font-mono font-semibold">{liveProduct.rating}</span>
                  <span className="text-neutral-500 text-[11px]">({liveProduct.reviewCount} customer reviews)</span>
                </div>
              </div>

              {/* Price and Stock status in INR */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-semibold font-mono text-white tabular-nums">
                  ₹{liveProduct.price.toLocaleString('en-IN')}
                </span>
                {liveProduct.compareAtPrice && liveProduct.compareAtPrice > liveProduct.price && (
                  <span className="text-sm font-mono text-neutral-500 line-through tabular-nums">
                    ₹{liveProduct.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}

                <div className="ml-auto text-xs font-mono">
                  {isOutOfStock ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of stock
                    </span>
                  ) : isLowStock ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Only {liveProduct.inventoryCount} left in warehouse
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {liveProduct.inventoryCount} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Tab 1: Product Specifications & Description */}
              {activeTab === 'details' && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {liveProduct.description}
                  </p>

                  {liveProduct.features && liveProduct.features.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Craftsmanship Highlights
                      </div>
                      <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                        {liveProduct.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Reviews & Add Review (FR17) */}
              {activeTab === 'reviews' && (
                <div className="mt-4 space-y-4 max-h-[260px] overflow-y-auto pr-1 animate-fade-in">
                  {/* Write a review form */}
                  <form onSubmit={handleAddReview} className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-200">Rate & Review (FR17)</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`cursor-pointer ${star <= reviewRating ? 'text-amber-400' : 'text-neutral-600'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Share your verified experience with this studio object..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 text-xs"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-3 py-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-semibold rounded text-[11px] cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>

                  {/* List of reviews */}
                  <div className="space-y-2">
                    {liveProduct.reviews && liveProduct.reviews.length > 0 ? (
                      liveProduct.reviews.map((rev) => (
                        <div key={rev.reviewId} className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-200">{rev.userName}</span>
                            <div className="text-amber-400 font-mono text-[11px]">
                              {'★'.repeat(rev.rating)}
                            </div>
                          </div>
                          <p className="text-neutral-400 text-[11px]">{rev.comment}</p>
                          <div className="text-[10px] text-neutral-500 font-mono pt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-neutral-500 italic py-4 text-center">
                        No reviews yet. Be the first to share your experience!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Controls */}
            <div className="pt-6 border-t border-neutral-800 space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-900 overflow-hidden">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    disabled={selectedQty <= 1 || isOutOfStock}
                    className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-mono font-medium text-white tabular-nums">
                    {selectedQty}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedQty(Math.min(liveProduct.inventoryCount, selectedQty + 1))
                    }
                    disabled={selectedQty >= liveProduct.inventoryCount || isOutOfStock}
                    className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Primary Buy CTA in INR */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-6 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-md active:scale-98"
                >
                  {isOutOfStock ? (
                    <span>Sold Out — Backorder Queued</span>
                  ) : (
                    <span>Add to Cart · ₹{(liveProduct.price * selectedQty).toLocaleString('en-IN')}</span>
                  )}
                </button>
              </div>

              {/* Delivery Guarantees in INR */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Ships in 24 hours across India</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{liveProduct.warranty || 'Atelier Direct Warranty'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
