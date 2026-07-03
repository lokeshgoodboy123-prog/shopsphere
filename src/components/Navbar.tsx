import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import {
  ShoppingBag,
  Heart,
  User,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  Shield,
  LogOut,
  Clock,
  UserCheck
} from "lucide-react";

export default function Navbar() {
  const { user, cart, wishlistIds, theme, toggleTheme, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav id="shopsphere-navbar" className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B0F19]/95 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10 group-hover:bg-indigo-700 transition-colors duration-200">
                <span className="text-white font-extrabold text-base tracking-tight font-display">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                ShopSphere
              </span>
            </Link>
          </div>

          {/* Desktop Links & Search */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200/80 bg-slate-50 py-2 pl-4 pr-10 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 transition-all duration-200"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
              Products
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-indigo-400 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-rose-400 transition-all">
              <Heart className="h-5 w-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-indigo-400 transition-all">
              <ShoppingBag className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-1 rounded-full p-1.5 border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 transition-all"
              >
                <User className="h-4 w-4" />
                {user ? (
                  <span className="text-xs font-semibold px-1 max-w-[80px] truncate">{user.name}</span>
                ) : (
                  <span className="text-xs font-semibold px-1">Guest</span>
                )}
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950 animate-fade-in z-50">
                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-900">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 mt-1 text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 transition-all font-semibold"
                        >
                          <Shield className="h-4 w-4" /> Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900 transition-all"
                      >
                        <UserCheck className="h-4 w-4" /> Profile Details
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900 transition-all"
                      >
                        <Clock className="h-4 w-4" /> My Orders
                      </Link>

                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 mt-1 border-t border-gray-100 dark:border-gray-900 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all font-medium text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900 transition-all font-medium"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 mt-1 bg-indigo-600 text-sm text-white hover:bg-indigo-700 transition-all font-medium text-center justify-center shadow-md shadow-indigo-600/10"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 transition-all"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart Icon Mobile */}
            <Link to="/cart" className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 transition-all">
              <ShoppingBag className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {totalCartItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 animate-slide-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-indigo-500"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col gap-3">
            <Link to="/products" onClick={() => setIsOpen(false)} className="text-base font-semibold text-gray-800 dark:text-gray-200 py-1 border-b border-gray-100 dark:border-gray-900">
              Explore Products
            </Link>
            <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200 py-1 border-b border-gray-100 dark:border-gray-900">
              <Heart className="h-4 w-4 text-rose-500" /> Wishlist ({wishlistIds.length})
            </Link>

            {user ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg mt-2">
                  <p className="text-xs text-gray-400">Logged in as</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                </div>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="text-base font-bold text-amber-600 dark:text-amber-400 py-1">
                    🛡️ Admin Console
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-300 py-1">
                  My Profile
                </Link>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-300 py-1">
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 text-base font-bold text-rose-600 mt-2 text-left"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-gray-300 dark:border-gray-700 py-2 text-center font-semibold text-gray-800 dark:text-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-indigo-600 py-2 text-center font-semibold text-white shadow-md shadow-indigo-600/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
