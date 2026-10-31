import React from 'react';
import { ArrowDown, ShieldCheck, Truck, RefreshCw, Laptop, Smartphone, Headphones, Tv, Printer, Cable } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-[#0f1012]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Value Intent */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
              TECHNOLOGY FOR EVERYDAY LIFE
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-white leading-[1.15] max-w-xl">
              Your world of electronics, all in one place.
            </h1>

            <p className="text-neutral-400 text-base leading-relaxed max-w-lg">
              Explore laptops, smartphones, audio, TVs, printers and everyday tech accessories. Find the right gear with straightforward pricing and live stock availability.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 text-xs uppercase tracking-wider font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Explore Catalog</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Free Express Shipping across India over ₹1,500</span>
                <span aria-hidden="true">·</span>
                <span>Real-time Stock</span>
              </div>
            </div>
          </div>

          {/* Electronics category showcase: icons are temporary until product photos are added. */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-gradient-to-br from-neutral-900 to-[#17140d] aspect-16/10 shadow-2xl flex items-center justify-center p-8">
              <div className="grid grid-cols-3 gap-8 sm:gap-10 text-amber-300">
                {[Laptop, Smartphone, Headphones, Tv, Printer, Cable].map((Icon, index) => <div key={index} className="flex items-center justify-center rounded-2xl border border-amber-400/20 bg-black/20 p-4 sm:p-5"><Icon className="w-9 h-9 sm:w-12 sm:h-12 stroke-[1.25]" /></div>)}
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">Smart choices. Everyday technology.</div>
            </div>
          </div>
        </div>

        {/* Quiet 3-Pillar Confidence Bar below the fold */}
        <div className="mt-14 pt-8 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-neutral-400 text-xs">
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-neutral-200 font-medium">Reliable Delivery</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Convenient delivery options for your electronics orders.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-neutral-200 font-medium">Stock Availability</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Product availability is kept up to date as orders are placed.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-neutral-200 font-medium">Customer Support</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">Help choosing products and support with your purchase.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
