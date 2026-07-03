import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp, api } from "../context/AppContext.tsx";
import { IAddress } from "../types.js";
import { ShieldCheck, Plus, Trash2, CreditCard, Landmark, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const {
    user,
    cart,
    appliedCoupon,
    addAddress,
    deleteAddress,
    clearCart,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Selected Address
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Payment Method choice
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");

  // New Address form toggle
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
  });

  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      showToast("Please register or log in to access the checkout gateway.", "warning");
      navigate("/login?redirect=checkout");
      return;
    }
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }
    // Set default selected address if available
    const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id);
    }
  }, [user, cart]);

  if (!user || cart.length === 0) return null;

  // Calculate prices
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

  let couponDiscount = 0;
  if (appliedCoupon && subtotalAfterItemDiscounts >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === "percentage") {
      couponDiscount = subtotalAfterItemDiscounts * (appliedCoupon.discountValue / 100);
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  const finalSubtotal = subtotalAfterItemDiscounts - couponDiscount;
  const shipping = finalSubtotal >= 12000 ? 0 : 1000;
  const tax = Math.round(finalSubtotal * 0.08);
  const grandTotal = finalSubtotal + shipping + tax;

  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, street, city, state, zip, phone } = newAddress;
    if (!name || !street || !city || !state || !zip || !phone) {
      showToast("Please fill all address fields.", "warning");
      return;
    }

    try {
      await addAddress({
        ...newAddress,
        isDefault: user.addresses.length === 0,
      });
      setShowNewAddressForm(false);
      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        phone: "",
      });
      // set selected address to newest
      const updatedUser = user; // triggers effect sync
    } catch {
      showToast("Failed to register address.", "error");
    }
  };

  // Helper to load external scripts (Razorpay)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast("Please select or add a shipping address.", "warning");
      return;
    }

    const selectedAddressObj = user.addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddressObj) return;

    setPlacingOrder(true);

    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price * (1 - (item.product.discount || 0) / 100),
        quantity: item.quantity,
        image: item.product.images?.[0] || "",
      })),
      shippingAddress: {
        name: selectedAddressObj.name,
        street: selectedAddressObj.street,
        city: selectedAddressObj.city,
        state: selectedAddressObj.state,
        zip: selectedAddressObj.zip,
        country: selectedAddressObj.country,
        phone: selectedAddressObj.phone,
      },
      phoneNumber: selectedAddressObj.phone,
      paymentMethod,
      paymentStatus: "pending",
      subtotal: finalSubtotal,
      shipping,
      tax,
      discount: itemsDiscount + couponDiscount,
      grandTotal,
    };

    if (paymentMethod === "cod") {
      try {
        const res = await api.post("/orders", {
          ...orderPayload,
          paymentStatus: "pending",
        });
        clearCart();
        showToast("Order placed successfully under COD!", "success");
        navigate(`/payment-success?orderId=${res.data.order._id}`);
      } catch (err) {
        showToast("Checkout pipeline error.", "error");
      } finally {
        setPlacingOrder(false);
      }
    } else {
      // RAZORPAY INTEGRATION
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          showToast("Failed to load secure Razorpay payment assets.", "error");
          setPlacingOrder(false);
          return;
        }

        // Initialize Order with Backend
        const orderRes = await api.post("/payment/create-order", {
          amount: grandTotal,
        });

        const { id: razorpayOrderId, keyId, amount, currency } = orderRes.data;

        // Configuration Options for Razorpay Modal
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "ShopSphere E-Commerce",
          description: "Premium Catalog Invoice Settlement",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop",
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            // Success handler callback
            try {
              // Verify on backend
              const verifyRes = await api.post("/payment/verify", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                // Post final order to Database
                const res = await api.post("/orders", {
                  ...orderPayload,
                  paymentStatus: "paid",
                  paymentId: response.razorpay_payment_id,
                });
                clearCart();
                showToast("Payment settled! Order placed successfully.", "success");
                navigate(`/payment-success?orderId=${res.data.order._id}`);
              } else {
                navigate("/payment-failed");
              }
            } catch (err) {
              showToast("Payment confirmation sync failure.", "error");
              navigate("/payment-failed");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: selectedAddressObj.phone,
          },
          theme: {
            color: "#4f46e5",
          },
          modal: {
            ondismiss: function () {
              setPlacingOrder(false);
              showToast("Payment checkout cancelled by client.", "info");
            },
          },
        };

        // Initialize Razorpay window object (simulate fallback if keys are generic)
        if (keyId.startsWith("rzp_test_shopsphere_key")) {
          // SANDBOX SIMULATOR (for seamless local preview)
          showToast("ShopSphere sandbox mode active: Simulating instant transaction payment...", "info");
          setTimeout(async () => {
            try {
              const res = await api.post("/orders", {
                ...orderPayload,
                paymentStatus: "paid",
                paymentId: "pay_sphere_sandbox_" + Math.random().toString(36).substring(2, 10),
              });
              clearCart();
              showToast("Sandbox payment settled successfully!", "success");
              navigate(`/payment-success?orderId=${res.data.order._id}`);
            } catch {
              navigate("/payment-failed");
            } finally {
              setPlacingOrder(false);
            }
          }, 1500);
        } else {
          // Open Real Razorpay Gateway
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }

      } catch (error) {
        showToast("Checkout payment pipeline error.", "error");
        setPlacingOrder(false);
      }
    }
  };

  return (
    <div id="shopsphere-checkout" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-8">
        Billing & Shipping Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Columns (Shipping address and Payments selection) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping addresses list */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-900">
              <h2 className="font-black text-gray-950 dark:text-white text-sm">
                1. Select Shipping Address
              </h2>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
              >
                <Plus className="h-3 w-3" /> Add New Address
              </button>
            </div>

            {showNewAddressForm && (
              <form onSubmit={handleNewAddressSubmit} className="space-y-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/10 dark:border-indigo-900 dark:bg-indigo-950/25">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">Receiver's Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
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
                      placeholder="e.g. 9876543210"
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
                      placeholder="e.g. Flat 104, Blue Ridge Apartment"
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
                      placeholder="e.g. Mumbai"
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
                      placeholder="e.g. Maharashtra"
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
                      placeholder="e.g. 400001"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      required
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-500"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {user.addresses?.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                <p>No saved addresses registered yet. Please click 'Add New Address' to continue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {user.addresses.map((addr) => {
                  const isSel = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSel
                          ? "border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/10"
                          : "border-gray-150 hover:bg-gray-55 dark:border-gray-850 dark:hover:bg-gray-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800 dark:text-white">{addr.name}</span>
                          {isSel && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                        </div>
                        <p className="text-gray-500 line-clamp-2 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                        <p className="text-gray-400 mt-2 font-semibold">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex justify-end mt-4 pt-2 border-t border-gray-100 dark:border-gray-900">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(addr._id);
                          }}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-500 flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment gateways list */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="font-black text-gray-950 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-gray-900">
              2. Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* COD */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  paymentMethod === "cod"
                    ? "border-indigo-600 bg-indigo-50/15 dark:bg-indigo-950/10"
                    : "border-gray-150 hover:bg-gray-55 dark:border-gray-850"
                }`}
              >
                <div className={`p-2.5 rounded-lg border ${paymentMethod === "cod" ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-gray-50 text-gray-500 dark:bg-gray-900"}`}>
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-850 dark:text-white">Cash on Delivery (COD)</h3>
                  <p className="text-gray-450 mt-0.5">Pay in cash on actual delivery</p>
                </div>
              </div>

              {/* Razorpay */}
              <div
                onClick={() => setPaymentMethod("razorpay")}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  paymentMethod === "razorpay"
                    ? "border-indigo-600 bg-indigo-50/15 dark:bg-indigo-950/10"
                    : "border-gray-150 hover:bg-gray-55 dark:border-gray-850"
                }`}
              >
                <div className={`p-2.5 rounded-lg border ${paymentMethod === "razorpay" ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-gray-50 text-gray-500 dark:bg-gray-900"}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-850 dark:text-white">Razorpay Secure Checkout</h3>
                  <p className="text-gray-450 mt-0.5">Cards, Netbanking, Wallets, UPI</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary calculations */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="font-black text-gray-950 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-gray-900">
              Order Summary
            </h2>

            {/* Micro items summary */}
            <div className="max-h-40 overflow-y-auto space-y-3 pb-3 border-b border-gray-100 dark:border-gray-900 pr-1">
              {cart.map((item) => {
                const price = item.product.price * (1 - (item.product.discount || 0) / 100);
                return (
                  <div key={item.productId} className="flex gap-2 text-xs items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <img src={item.product.images?.[0]} className="h-8 w-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white line-clamp-1">{item.product.name}</p>
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-gray-900 dark:text-white">₹{(Math.round(price) * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal (After Item Discounts)</span>
                <span>₹{subtotalAfterItemDiscounts.toLocaleString("en-IN")}</span>
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
                <span>Total Settled Invoice</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Place order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xs py-3.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {placingOrder ? "Placing Order..." : `Settle & Pay ₹${grandTotal.toLocaleString("en-IN")}`}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/40 flex gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              ShopSphere Escrow protects transactions. In-transit delays or package mismatches qualify for automated easy replacement.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
