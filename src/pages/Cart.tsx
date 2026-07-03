import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, ShoppingCart, RefreshCw, X } from "lucide-react";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    showToast
  } = useApp();

  const navigate = useNavigate();
  const [couponText, setCouponText] = useState("");
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950 p-6 mb-4">
          <ShoppingCart className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl tracking-tight">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
          It looks like you haven't selected any workspace assets or premium gadgets yet. Explore our curated collections to get started.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-98"
        >
          Begin Shopping
        </Link>
      </div>
    );
  }

  // Calculate pricing matrices
  let originalSubtotal = 0;
  let itemsDiscount = 0;

  cart.forEach((item) => {
    const qty = item.quantity;
    const price = item.product.price;
    const discountPercent = item.product.discount || 0;

    originalSubtotal += price * qty;
    itemsDiscount += (price * (discountPercent / 100)) * qty;
  });

  const subtotalAfterItemDiscounts = originalSubtotal - itemsDiscount;

  // Coupon calculations
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (subtotalAfterItemDiscounts >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === "percentage") {
        couponDiscount = subtotalAfterItemDiscounts * (appliedCoupon.discountValue / 100);
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
    } else {
      // Order value too low for coupon, remove coupon
      removeCouponCode();
      showToast(`Coupon removed. Minimum order value of ₹${appliedCoupon.minOrderValue.toLocaleString("en-IN")} is required.`, "warning");
    }
  }

  const finalSubtotal = subtotalAfterItemDiscounts - couponDiscount;
  const totalDiscount = itemsDiscount + couponDiscount;

  // Flat rates in Rupees
  const shipping = finalSubtotal >= 12000 ? 0 : 1000;
  const tax = Math.round(finalSubtotal * 0.08); // 8% standard tax
  const grandTotal = finalSubtotal + shipping + tax;

  const handleQtyChange = (productId: string, currentQty: number, offset: number, stock: number) => {
    const target = currentQty + offset;
    if (target >= 1 && target <= stock) {
      updateCartQuantity(productId, target);
    } else if (target < 1) {
      removeFromCart(productId);
    } else {
      showToast("Cannot exceed available warehouse stock bounds.", "warning");
    }
  };

  const handleCouponApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponText.trim()) return;

    setVerifyingCoupon(true);
    try {
      await applyCouponCode(couponText.trim().toUpperCase());
      setCouponText("");
    } catch {
      // error is handled inside context showToast
    } finally {
      setVerifyingCoupon(false);
    }
  };

  return (
    <div id="shopsphere-cart" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-8">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* Cart items grid list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const hasDiscount = item.product.discount > 0;
            const singleOriginal = item.product.price;
            const singleFinal = hasDiscount
              ? Math.round(singleOriginal * (1 - item.product.discount / 100))
              : singleOriginal;

            return (
              <div
                key={item.productId}
                id={`cart-item-${item.productId}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm gap-4"
              >
                {/* Visual */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border flex-shrink-0">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Brand: {item.product.brand || "Sphere"}</p>
                    {/* Price labels inside info */}
                    <div className="mt-1 flex items-baseline gap-2 sm:hidden">
                      <span className="text-sm font-black text-gray-900 dark:text-white">₹{singleFinal.toLocaleString("en-IN")}</span>
                      {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{singleOriginal.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                </div>

                {/* Controls (quantity and delete) */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-900">
                  
                  {/* Quantity Widget */}
                  <div className="flex items-center border border-gray-150 dark:border-gray-850 rounded-lg p-1 bg-white dark:bg-gray-900">
                    <button
                      onClick={() => handleQtyChange(item.productId, item.quantity, -1, item.product.stock)}
                      className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Decrease Quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.productId, item.quantity, 1, item.product.stock)}
                      className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Increase Quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Desktop Price indicators */}
                  <div className="hidden sm:flex flex-col text-right min-w-[80px]">
                    <span className="text-sm font-black text-gray-900 dark:text-white">₹{(singleFinal * item.quantity).toLocaleString("en-IN")}</span>
                    {hasDiscount && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{(singleOriginal * item.quantity).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Trash delete */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    aria-label="Remove item from cart"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>

        {/* Invoice Summary sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="font-black text-gray-950 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-gray-900">
              Checkout Invoice Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Original Subtotal</span>
                <span>₹{originalSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Total Savings / Discounts</span>
                <span className="text-emerald-500 font-bold">-₹{totalDiscount.toLocaleString("en-IN")}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Express Shipping</span>
                <span>{shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax Flat Rate (8%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-900 pt-3 flex justify-between text-base font-black text-gray-950 dark:text-white">
                <span>Grand Total Invoice</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Coupons Form */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-900 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Apply Promo / Coupon</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-850">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black text-indigo-800 dark:text-indigo-400">
                      {appliedCoupon.code} ACTIVE
                    </span>
                  </div>
                  <button onClick={removeCouponCode} className="text-gray-400 hover:text-rose-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponApply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SPHERE15"
                    value={couponText}
                    onChange={(e) => setCouponText(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white uppercase outline-none"
                  />
                  <button
                    type="submit"
                    disabled={verifyingCoupon}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {verifyingCoupon ? "Verifying..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xs py-3.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-98"
            >
              Proceed to Shipping <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/40 flex gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Every purchase in ShopSphere is protected by dynamic escrow. Secured connection protocols shield your details.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
