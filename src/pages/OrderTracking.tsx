import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, useApp } from "../context/AppContext.tsx";
import { IOrder } from "../types.js";
import { Check, Clock, Package, Truck, Smile, ArrowLeft, Ban, ShieldCheck, Mail } from "lucide-react";

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Order tracking load failed:", err);
        showToast("Unable to fetch tracking data.", "error");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) return null;

  // Tracking Milestones definitions
  const milestones = [
    { label: "Pending", description: "Order queued and pending administrative verification", icon: Clock },
    { label: "Confirmed", description: "Verification complete, invoice successfully processed", icon: ShieldCheck },
    { label: "Packed", description: "Package sealed and loaded onto transfer palettes", icon: Package },
    { label: "Shipped", description: "Handed over to logistic hubs, carrier transit active", icon: Truck },
    { label: "Delivered", description: "Package dropped off safely at the selected delivery bounds", icon: Smile },
  ];

  // Map order status to index bounds
  const getActiveIndex = (status: string) => {
    switch (status) {
      case "Pending": return 0;
      case "Confirmed": return 1;
      case "Packed": return 2;
      case "Shipped": return 3;
      case "Delivered": return 4;
      default: return -1;
    }
  };

  const activeIndex = getActiveIndex(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div id={`shopsphere-tracking-${order._id}`} className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      {/* Return link */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Return to My Orders
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Tracking timeline */}
        <div className="md:col-span-8 bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-8">
          
          <div>
            <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">
              Trace Package Transit
            </h1>
            <p className="text-xs text-gray-400 mt-1">Live updates synced directly with local logistic hubs</p>
          </div>

          {isCancelled ? (
            <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/20 text-center flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600">
                <Ban className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Package Logistics Stopped</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">This order was cancelled by the client or declined during payment settlement. No packaging actions will proceed.</p>
              </div>
            </div>
          ) : (
            /* Render milestone list */
            <div className="space-y-8 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-850">
              {milestones.map((milestone, idx) => {
                const isCompleted = idx < activeIndex;
                const isActive = idx === activeIndex;
                const isPending = idx > activeIndex;

                const Icon = milestone.icon;

                // Color configuration
                const iconBgClass = isCompleted
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25"
                  : isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 animate-pulse"
                    : "bg-gray-50 text-gray-300 border-gray-200 dark:bg-gray-900 dark:border-gray-800";

                return (
                  <div key={milestone.label} className="relative flex gap-4 items-start text-xs group">
                    
                    {/* Circle checkpoint */}
                    <div className={`absolute -left-[27px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs transition-all ${iconBgClass}`}>
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-current"></div>}
                    </div>

                    <div className="space-y-1">
                      <h3 className={`font-black text-sm tracking-tight transition-colors ${
                        isCompleted
                          ? "text-emerald-500"
                          : isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400"
                      }`}>
                        {milestone.label} {isActive && "· Active"}
                      </h3>
                      <p className="text-gray-450 leading-relaxed dark:text-gray-500 max-w-md">{milestone.description}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right column: Delivery recipient details & items list */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Deliver box */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4 text-xs">
            <h3 className="font-black text-gray-950 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-gray-900">
              Delivery Destination
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-gray-850 dark:text-white">{order.shippingAddress.name}</p>
              <p className="text-gray-500 leading-relaxed">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
              <p className="text-gray-400 font-semibold mt-2">Phone: {order.phoneNumber}</p>
            </div>
          </div>

          {/* Items box */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4 text-xs">
            <h3 className="font-black text-gray-950 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-gray-900">
              Purchased Items
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs gap-2">
                  <div className="flex gap-2 items-center">
                    <img src={item.image} className="h-8 w-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-950 dark:text-white">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-900 flex justify-between text-sm font-black text-gray-950 dark:text-white">
              <span>Invoice Total</span>
              <span>₹{(order.grandTotal !== undefined && order.grandTotal !== null ? order.grandTotal : (order.totalAmount || 0)).toLocaleString("en-IN")}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
