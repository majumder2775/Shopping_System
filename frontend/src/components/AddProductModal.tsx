import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { mernApi } from '../services/api';
import { ProductCategory } from '../types';
import { X, Plus, PackageCheck, Image as ImageIcon } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const AddProductModal: React.FC = () => {
  const { isAddProductModalOpen, setIsAddProductModalOpen, showToast } = useShop();

  const [name, setName] = useState('');
  const [sku, setSku] = useState(`AUR-SKU-${Math.floor(100 + Math.random() * 900)}`);
  const [brand, setBrand] = useState('DIGITAL STORE');
  const [category, setCategory] = useState<ProductCategory>('Laptops & Computers');
  const [price, setPrice] = useState('290');
  const [inventoryCount, setInventoryCount] = useState('12');
  const [lowStockThreshold, setLowStockThreshold] = useState('4');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  if (!isAddProductModalOpen) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      e.target.value = '';
      return showToast('Use a JPG, PNG, WEBP or GIF image.');
    }
    if (f.size > 2 * 1024 * 1024) {
      e.target.value = '';
      return showToast('Image must be under 2 MB.');
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    setIsSubmitting(true);
    try {
      // upload the photo first; backend returns e.g. "/uploads/1730000000-photo.jpg"
      const imageUrl = file ? await mernApi.uploadImage(file) : '';

      await mernApi.createProduct({
        name,
        sku,
        brand,
        category,
        price: parseFloat(price) || 99,
        inventoryCount: parseInt(inventoryCount, 10) || 5,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 3,
        rating: 5.0,
        reviewCount: 1,
        images: imageUrl ? [imageUrl] : [],
        description: description || 'Artisanal studio object designed with precision materials and honest craftsmanship.',
        features: [
          'Precision CNC-machined components',
          'Eco-friendly sustainable packaging',
          'Atelier direct warranty',
        ],
        featured: false,
      });

      showToast(`SKU ${sku} successfully inserted into MongoDB!`);
      resetImage();
      setIsAddProductModalOpen(false);
    } catch (err: any) {
      showToast(`Error creating product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Add New Product (Admin MongoDB Insert)
            </h2>
          </div>
          <button
            onClick={() => setIsAddProductModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Minimalist Aluminum Sound Dock"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Laptops & Computers">Laptops & Computers</option>
                <option value="Mobile Phones">Mobile Phones</option>
                <option value="Audio & Headphones">Audio & Headphones</option>
                <option value="TVs & Displays">TVs & Displays</option>
                <option value="Printers & Scanners">Printers & Scanners</option>
                <option value="Accessories">Accessories</option>
                <option value="Home Electronics">Home Electronics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Unit Price (₹ INR) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 2499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Initial Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={inventoryCount}
                onChange={(e) => setInventoryCount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Low Alert Threshold</label>
              <input
                type="number"
                required
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Product Description</label>
            <textarea
              rows={3}
              placeholder="Provide craft materials, specifications, and design rationale..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Product photo upload */}
          <div>
            <label className="block text-neutral-400 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Product Photo (JPG, PNG, WEBP, GIF, max 2 MB)</span>
            </label>
            <input
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFile}
              className="block w-full text-neutral-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-amber-400 file:text-neutral-950 file:font-semibold cursor-pointer"
            />
            {preview && (
              <div className="mt-3 flex items-center gap-3">
                <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-neutral-800" />
                <button
                  type="button"
                  onClick={resetImage}
                  className="text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="px-4 py-2 text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Inserting...' : 'Commit to MongoDB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
