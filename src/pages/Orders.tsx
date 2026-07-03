import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useApp } from "../context/AppContext.tsx";
import { IOrder } from "../types.js";
import { ShoppingBag, Calendar, CheckSquare, Compass, Eye, ShieldAlert } from "lucide-react";

export default function Orders() {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=orders");
      return;
    }

    async function fetchOrders() {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load order history:", err);
        showToast("Unable to restore order history.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 p-6 mb-4">
          <ShoppingBag className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl tracking-tight">
          No Orders Placed Yet
        </h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
          It seems you haven't checked out any products yet. Browse through our premium tech, fashion, and home workspace collections.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-98"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div id="shopsphere-orders" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      <div className="flex items-center gap-2 mb-8">
        <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
          <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </span>
        <div>
          <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Order Registry & History
          </h1>
          <p className="text-xs text-gray-400 mt-1">Review receipts and trace package logistics</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          // Status color configurations
          const statusColors =
            order.orderStatus === "Delivered"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
              : order.orderStatus === "Cancelled"
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900";

          return (
            <div
              key={order._id}
              id={`order-block-${order._id}`}
              className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              
              {/* Header section (metadata) */}
              <div className="bg-gray-50/50 dark:bg-gray-900/30 p-4 sm:p-5 border-b border-gray-100 dark:border-gray-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">ORDER IDENTIFICATION</p>
                  <p className="font-mono text-gray-700 dark:text-white mt-1 font-bold">{order._id.substring(0, 15)}...</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">PLACED ON</p>
                  <p className="text-gray-750 dark:text-gray-300 mt-1 font-bold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">TOTAL INVOICE</p>
                  <p className="text-gray-900 dark:text-white mt-1 font-black text-sm">₹{(order.grandTotal !== undefined && order.grandTotal !== null ? order.grandTotal : (order.totalAmount || 0)).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">DELIVERY STATUS</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColors}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Body Section (Items thumbnails) */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                
                <div className="flex-1 space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-150 flex-shrink-0">
                        <img src={item.image} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-xs">
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-gray-400 mt-0.5">Qty: {item.quantity} · Price: ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Action Button */}
                <div className="w-full sm:w-auto flex gap-2">
                  <Link
                    to={`/orders/track/${order._id}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-indigo-600/10"
                  >
                    <Compass className="h-4 w-4" /> Trace Package
                  </Link>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
