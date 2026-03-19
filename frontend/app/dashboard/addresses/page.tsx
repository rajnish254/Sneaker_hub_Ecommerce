'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useStore } from '@/lib/store';

interface Address {
  id: string;
  name: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    name: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load addresses from localStorage or API
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoading(true);
        // Try to fetch from localStorage first
        const savedAddresses = localStorage.getItem(`addresses_${user?.email}`);
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadAddresses();
    }
  }, [isAuthenticated, user]);

  const handleAddAddress = () => {
    if (newAddress.fullName && newAddress.addressLine1 && newAddress.city) {
      const updatedAddresses = [
        ...addresses,
        {
          id: String(addresses.length + 1),
          ...newAddress,
          isDefault: addresses.length === 0, // First address is default
        },
      ];
      setAddresses(updatedAddresses);
      localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
      setNewAddress({
        name: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
      });
      setShowAddForm(false);
    }
  };

  const handleDelete = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
  };

  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Saved Addresses</h1>
              <p className="text-[#7a8ba8]">Manage your delivery addresses</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              + Add New Address
            </button>
          </div>
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Address</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Address Type (e.g., Home, Office)"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />

              <input
                type="text"
                placeholder="Address Line 1"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />

              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Save Address ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#7a8ba8]">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#7a8ba8] mb-4">No addresses saved yet</p>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              + Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`relative group bg-gradient-to-br ${
                  address.isDefault ? 'from-purple-600/20 to-pink-600/20' : 'from-[#181e2a] to-[#1a2535]'
                } border ${address.isDefault ? 'border-purple-500/50' : 'border-[#232a3a]'} rounded-2xl p-6 hover:border-[#3d4f62] transition-all`}
              >
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Default
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{address.name}</h3>
                  <p className="text-[#bfc8e6]">{address.fullName}</p>
                  <p className="text-[#7a8ba8] text-sm">{address.phone}</p>
                </div>

                <div className="bg-[#1a2332] bg-opacity-50 rounded-lg p-4 mb-4 border border-[#232a3a]">
                  <p className="text-[#bfc8e6] mb-1">{address.addressLine1}</p>
                  {address.addressLine2 && <p className="text-[#bfc8e6] mb-1">{address.addressLine2}</p>}
                  <p className="text-[#bfc8e6]">
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold py-2 rounded-lg transition text-sm"
                    >
                      Set as Default
                    </button>
                  )}
                  <button className="flex-1 bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-semibold py-2 rounded-lg transition text-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold py-2 rounded-lg transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
