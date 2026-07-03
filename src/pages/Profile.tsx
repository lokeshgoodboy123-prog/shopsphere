import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import { User, ShieldAlert, KeyRound, MapPin, ClipboardList, Plus, Trash2 } from "lucide-react";

export default function Profile() {
  const {
    user,
    updateProfile,
    changePassword,
    addAddress,
    deleteAddress,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Selected tab state
  const [activeTab, setActiveTab] = useState<"info" | "addresses">("info");

  // Info Form State
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });

  // Address form toggle
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=profile");
      return;
    }
    setProfileForm({ name: user.name, email: user.email });
  }, [user]);

  if (!user) return null;

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      showToast("Name and email are required.", "warning");
      return;
    }
    await updateProfile(profileForm.name, profileForm.email);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { current, next, confirm } = passwordForm;

    if (!current || !next || !confirm) {
      showToast("All password fields are required.", "warning");
      return;
    }
    if (next !== confirm) {
      showToast("New passwords do not match.", "warning");
      return;
    }

    try {
      await changePassword(current, next);
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch {
      // Handled in context
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, street, city, state, zip, phone } = newAddress;
    if (!name || !street || !city || !state || !zip || !phone) {
      showToast("All address fields are required.", "warning");
      return;
    }

    try {
      await addAddress({
        ...newAddress,
        isDefault: user.addresses.length === 0,
      });
      setShowAddressForm(false);
      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        phone: "",
      });
    } catch {
      // Handled in context
    }
  };

  return (
    <div id="shopsphere-profile-sheet" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      <div className="flex items-center gap-2 mb-8">
        <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </span>
        <div>
          <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            My Account Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage private information and addresses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Tabs and quick stats */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden p-4">
            
            {/* Quick profile info */}
            <div className="text-center py-6 border-b border-gray-100 dark:border-gray-900 mb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white mt-3 truncate">{user.name}</h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>

            {/* Nav List */}
            <div className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "info"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/45 dark:text-indigo-400"
                    : "text-gray-650 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                }`}
              >
                <KeyRound className="h-4 w-4" /> Personal Information
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "addresses"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/45 dark:text-indigo-400"
                    : "text-gray-650 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                }`}
              >
                <MapPin className="h-4 w-4" /> Manage Saved Addresses
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-gray-650 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900 transition-all text-left"
              >
                <ClipboardList className="h-4 w-4" /> Order History Registry
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="md:col-span-8 bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm">
          
          {activeTab === "info" && (
            <div className="space-y-8 text-xs">
              
              {/* Update contact information */}
              <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-900">
                <h2 className="font-black text-gray-950 dark:text-white text-sm">Update Contact Credentials</h2>
                <form onSubmit={handleInfoSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">Account Username</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">Registered Email</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password */}
              <div className="space-y-4">
                <h2 className="font-black text-gray-950 dark:text-white text-sm">Modify Security Password</h2>
                <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-900">
                <h2 className="font-black text-gray-950 dark:text-white text-sm">Saved Delivery Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
                >
                  <Plus className="h-3 w-3" /> Add New Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="space-y-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/15 dark:border-indigo-900 dark:bg-indigo-950/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase tracking-wider">Receiver's Name</label>
                      <input
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase tracking-wider">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-500 uppercase tracking-wider">Street Address / Block</label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase tracking-wider">State / Province</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase tracking-wider">Zip / PIN Code</label>
                      <input
                        type="text"
                        required
                        value={newAddress.zip}
                        onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:text-white"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-500">
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {user.addresses?.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p>No saved addresses registered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-4 rounded-xl border border-gray-150 dark:border-gray-850 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800 dark:text-white">{addr.name}</span>
                          {addr.isDefault && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black text-indigo-600">DEFAULT</span>}
                        </div>
                        <p className="text-gray-500 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                        <p className="text-gray-400 font-semibold mt-2">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex justify-end mt-4 pt-2 border-t border-gray-100 dark:border-gray-900">
                        <button
                          onClick={() => deleteAddress(addr._id)}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-500 flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
