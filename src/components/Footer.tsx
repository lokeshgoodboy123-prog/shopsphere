import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck, Truck, RefreshCw, HelpCircle } from "lucide-react";
import { useApp } from "../context/AppContext.tsx";

export default function Footer() {
  const { showToast } = useApp();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast(`Thank you for subscribing! Exquisite weekly offers will arrive at ${email}.`, "success");
      setEmail("");
    }
  };

  return (
    <footer id="shopsphere-footer" className="bg-gray-950 text-gray-400 border-t border-gray-900 transition-colors duration-300">
      
      {/* Services bar */}
      <div className="border-b border-gray-900/60 bg-gray-950/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30">
              <Truck className="h-8 w-8 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-100">Free Express Delivery</h4>
                <p className="text-xs text-gray-500">For all purchases exceeding $150</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30">
              <RefreshCw className="h-8 w-8 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-100">Easy Returns Policy</h4>
                <p className="text-xs text-gray-500">30-day hassle-free replacement period</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30">
              <ShieldCheck className="h-8 w-8 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-100">100% Encrypted Payment</h4>
                <p className="text-xs text-gray-500">Secured via ShopSphere Safe Gateway</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30">
              <HelpCircle className="h-8 w-8 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-100">Support Center 24/7</h4>
                <p className="text-xs text-gray-500">Expert help is always available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              ShopSphere
            </span>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              Crafting premium shopping journeys with robust logistics, secured checkout pipelines, and catalog items of matchless quality.
            </p>
          </div>

          {/* Rapid Navigation */}
          <div>
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">My Profile</Link>
              </li>
            </ul>
          </div>

          {/* Hot Categories */}
          <div>
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider mb-4">Hot Collections</h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=fashion" className="hover:text-white transition-colors">Fashion & Wearables</Link>
              </li>
              <li>
                <Link to="/products?category=home" className="hover:text-white transition-colors">Home & Workspace</Link>
              </li>
              <li>
                <Link to="/products?category=sports" className="hover:text-white transition-colors">Sports & Fitness</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Subscribe to unlock premium discount coupons and sneak peeks at upcoming launches.
            </p>
            <form onSubmit={handleSubscribe} className="flex relative items-center">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-800 py-2 pl-3 pr-10 text-xs text-gray-100 outline-none focus:border-indigo-500 transition-all"
              />
              <button type="submit" className="absolute right-1 p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-gray-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-650">
          <p>© 2026 ShopSphere E-Commerce. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
