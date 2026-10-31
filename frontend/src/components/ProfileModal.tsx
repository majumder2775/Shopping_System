import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { mernApi } from '../services/api';
import { Address } from '../types';
import { X, User, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, currentUser, setCurrentUser, showToast } = useShop();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Add new address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  if (!isProfileOpen || !currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCurrentUser(await mernApi.updateProfile({ name, phone }));
      showToast('Customer profile details updated successfully (FR3).');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine1 || !newCity || !newPincode) return;

    try {
      setCurrentUser(
        await mernApi.addAddress({
          fullName: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          line1: newLine1,
          city: newCity,
          state: newState || 'Karnataka',
          pincode: newPincode,
          country: 'India',
          isDefault: false,
        })
      );
    } catch (err: any) {
      showToast(err.message);
      return;
    }
    setIsAddingAddress(false);
    setNewLine1('');
    setNewCity('');
    setNewPincode('');
    showToast('New delivery address saved with Pincode.');
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setCurrentUser(await mernApi.deleteAddress(addressId));
      showToast('Address removed from profile.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Profile & Saved Addresses (FR3)
            </h2>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: User Profile Details */}
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div className="text-xs font-mono uppercase text-amber-400">Account Credentials</div>
            <div>
              <label className="block text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Email (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-neutral-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Section 2: Saved Delivery Addresses (Line 1, City, State, Pincode) */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Saved Shipping Addresses</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingAddress ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Address Add Form */}
            {isAddingAddress && (
              <form onSubmit={handleCreateAddress} className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Street Address (Line 1) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 501, Horizon Heights, MG Road"
                    value={newLine1}
                    onChange={(e) => setNewLine1(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-400 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="Karnataka"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560001"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded text-xs cursor-pointer"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Address List */}
            <div className="space-y-2">
              {currentUser.savedAddresses && currentUser.savedAddresses.length > 0 ? (
                currentUser.savedAddresses.map((addr) => (
                  <div
                    key={addr.addressId}
                    className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-neutral-200">{addr.line1}</div>
                      <div className="text-neutral-400 text-[11px]">
                        {addr.city}, {addr.state} - <strong className="text-amber-300 font-mono">{addr.pincode}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr.addressId)}
                      className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                      title="Remove address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 text-xs italic py-2">
                  No saved addresses. Add an address for rapid checkout.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
