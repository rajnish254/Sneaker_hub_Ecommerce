'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

import Link from 'next/link';

export default function ProfilePage() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    gender: 'other',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = () => {
    setUser({
      id: user?.id || 'user-123',
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    });
    setSaveSuccess(true);
    setEditMode(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-[#7a8ba8]">Manage your account information and settings</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
            ✓ Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div>
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8 text-center sticky top-24">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-5xl shadow-lg">
                👤
              </div>
              <p className="text-white font-bold mb-1">{user?.firstName} {user?.lastName}</p>
              <p className="text-[#7a8ba8] text-sm mb-6">{user?.email}</p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 rounded-lg transition-all">
                Change Picture
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#7a8ba8] text-sm font-medium mb-2">First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-white font-medium">{formData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[#7a8ba8] text-sm font-medium mb-2">Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-white font-medium">{formData.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[#7a8ba8] text-sm font-medium mb-2">Email Address</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-white font-medium">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a8ba8] text-sm font-medium mb-2">Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-white font-medium">{formData.phone || 'Not provided'}</p>
                  )}
                </div>

                {editMode && (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all mt-6"
                  >
                    Save Changes ✓
                  </button>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#7a8ba8] text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[#7a8ba8] text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-[#7a8ba8] mt-2">Minimum 8 characters, include uppercase, lowercase, and numbers</p>
                </div>

                <div>
                  <label className="block text-[#7a8ba8] text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button className="w-full bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-bold py-3 rounded-lg transition">
                  Update Password
                </button>
              </div>
            </div>

            {/* Account Preferences */}
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>

              <div className="space-y-4">
                <label className="flex items-center p-4 bg-[#1a2332] border border-[#232a3a] rounded-lg hover:border-[#3d4f62] cursor-pointer transition">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="ml-3 text-white font-medium">Receive product notifications</span>
                </label>

                <label className="flex items-center p-4 bg-[#1a2332] border border-[#232a3a] rounded-lg hover:border-[#3d4f62] cursor-pointer transition">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="ml-3 text-white font-medium">Subscribe to newsletter</span>
                </label>

                <label className="flex items-center p-4 bg-[#1a2332] border border-[#232a3a] rounded-lg hover:border-[#3d4f62] cursor-pointer transition">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="ml-3 text-white font-medium">Receive promotional emails</span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#181e2a] border border-red-500/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-red-400 mb-6">Danger Zone</h2>
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-lg transition">
                Delete Account
              </button>
              <p className="text-xs text-[#7a8ba8] mt-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
