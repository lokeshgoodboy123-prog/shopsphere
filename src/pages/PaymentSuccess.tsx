import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "../context/AppContext.tsx";
import { IOrder } from "../types.js";
import { CheckCircle2, ShieldCheck, ArrowRight, Truck, Mail } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    async function loadOrder() {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load invoice receipt:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div id="payment-success-screen" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[80vh] flex flex-col justify-center transition-colors duration-300">
      
      <div className="bg-white dark:bg-gray-950 p-8 sm:p-10 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm text-center space-y-6">
        
        {/* Checkmark icon */}
        <div className="mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-4 w-20 h-20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Order Settled Successfully!
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            Your transaction has been processed securely. Order ID: <strong className="text-gray-700 dark:text-gray-300 font-mono">{orderId}</strong>
          </p>
        </div>

        {/* receipt info */}
        {order && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 dark:border-gray-900 dark:bg-gray-900/10 text-left space-y-3.5 text-xs">
            <h3 className="font-bold text-gray-800 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-900">Receipt Details</h3>
            <div className="flex justify-between text-gray-500">
              <span>Customer Name</span>
              <span className="font-semibold text-gray-700 dark:text-white">{order.userName}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Deliver To</span>
              <span className="font-semibold text-gray-700 dark:text-white truncate max-w-[200px]">
                {order.shippingAddress.street}, {order.shippingAddress.city}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment Mode</span>
              <span className="font-semibold text-gray-750 dark:text-white uppercase">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Total Settled Invoice</span>
              <span className="font-black text-gray-950 dark:text-white text-sm">₹{(order.grandTotal !== undefined && order.grandTotal !== null ? order.grandTotal : (order.totalAmount || 0)).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}

        {/* Mail dispatch details */}
        <div className="flex gap-2 items-start justify-center text-[11px] text-gray-400 text-left max-w-md mx-auto">
          <Mail className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p>
            An automated shipping confirmation receipt containing invoice details and a package tracking timeline link has been dispatched to your email address.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
          <Link
            to={`/orders/track/${orderId}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xs py-3.5 shadow-md"
          >
            <Truck className="h-4.5 w-4.5" /> Live Track Package
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-750 font-bold text-xs py-3.5 dark:border-gray-800 dark:text-gray-300"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
