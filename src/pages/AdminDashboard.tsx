import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, api } from "../context/AppContext.tsx";
import { IProduct, ICategory, IOrder, ICoupon } from "../types.js";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Tag,
  Plus,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles
} from "lucide-react";

export default function AdminDashboard() {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  // Selected Section
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "orders" | "coupons">("overview");

  // Admin Data states
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageValue: 0,
  });

  const [loading, setLoading] = useState(true);

  // Forms / Toggles
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);

  // Form State: Product
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    discount: "0",
    description: "",
    category: "",
    brand: "",
    stock: "50",
    imageInput: "",
  });

  // Form State: Category
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "" });

  // Form State: Coupon
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "15",
    minOrderValue: "100",
    expiryDate: "",
  });

  useEffect(() => {
    // Access validation
    if (!user || user.role !== "admin") {
      showToast("Access Denied: Administrative authorization is required.", "error");
      navigate("/");
      return;
    }

    loadAdminData();
  }, [user]);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [pRes, cRes, oRes, cpRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/admin/orders"),
        api.get("/admin/coupons"),
      ]);

      setProducts(pRes.data);
      setCategories(cRes.data);
      
      // Standardize and sanitize orders with robust fallbacks for legacy/other schemas
      const sanitizedOrders = oRes.data.map((o: any) => {
        const orderAmt = o.grandTotal !== undefined && o.grandTotal !== null ? o.grandTotal : (o.totalAmount || 0);
        return {
          ...o,
          grandTotal: typeof orderAmt === "number" ? orderAmt : parseFloat(orderAmt) || 0,
          userName: o.userName || "Valued Customer",
          phoneNumber: o.phoneNumber || o.shippingAddress?.phone || "N/A"
        };
      });

      setOrders(sanitizedOrders);
      setCoupons(cpRes.data);

      // Compile overview analytics
      const salesTotal = sanitizedOrders
        .filter((o: any) => o.orderStatus !== "Cancelled")
        .reduce((sum: number, o: any) => sum + o.grandTotal, 0);

      setStats({
        totalSales: salesTotal,
        totalOrders: sanitizedOrders.length,
        totalProducts: pRes.data.length,
        averageValue: sanitizedOrders.length > 0 ? Math.round(salesTotal / sanitizedOrders.length) : 0,
      });

    } catch (err) {
      console.error("Failed to compile administrative dashboards:", err);
      showToast("Failed to compile administration data sheets.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // CREATE Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, description, category, brand, stock, imageInput } = productForm;
    if (!name || !price || !category || !brand || !description || !stock) {
      showToast("Please fill all mandatory fields.", "warning");
      return;
    }

    try {
      const imagesArr = imageInput ? imageInput.split(",").map((s) => s.trim()) : [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
      ];

      await api.post("/admin/products", {
        ...productForm,
        price: parseFloat(price),
        discount: parseFloat(productForm.discount),
        stock: parseInt(stock),
        images: imagesArr,
      });

      showToast("Product created successfully!", "success");
      setShowProductForm(false);
      setProductForm({
        name: "",
        price: "",
        discount: "0",
        description: "",
        category: "",
        brand: "",
        stock: "50",
        imageInput: "",
      });
      loadAdminData();
    } catch {
      showToast("Failed to compile product entry.", "error");
    }
  };

  // DELETE Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast("Product deleted successfully.", "info");
      loadAdminData();
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  // CREATE Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, slug, description } = categoryForm;
    if (!name || !slug) {
      showToast("Name and slug are mandatory.", "warning");
      return;
    }

    try {
      await api.post("/admin/categories", categoryForm);
      showToast("Category registered successfully!", "success");
      setShowCategoryForm(false);
      setCategoryForm({ name: "", slug: "", description: "" });
      loadAdminData();
    } catch {
      showToast("Failed to index category.", "error");
    }
  };

  // DELETE Category
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      showToast("Category deleted.", "info");
      loadAdminData();
    } catch {
      showToast("Failed to purge category.", "error");
    }
  };

  // UPDATE Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}!`, "success");
      loadAdminData();
    } catch {
      showToast("Failed to shift package status.", "error");
    }
  };

  // CREATE Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const { code, discountValue, minOrderValue, expiryDate } = couponForm;
    if (!code || !discountValue || !expiryDate) {
      showToast("Please fill all coupon details.", "warning");
      return;
    }

    try {
      await api.post("/admin/coupons", {
        code: code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue),
        expiryDate: new Date(expiryDate).toISOString(),
        isActive: true,
      });

      showToast("Coupon activated successfully!", "success");
      setShowCouponForm(false);
      setCouponForm({
        code: "",
        discountType: "percentage",
        discountValue: "15",
        minOrderValue: "100",
        expiryDate: "",
      });
      loadAdminData();
    } catch {
      showToast("Failed to index promotion.", "error");
    }
  };

  // DELETE Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      showToast("Coupon removed.", "info");
      loadAdminData();
    } catch {
      showToast("Failed to delete coupon.", "error");
    }
  };

  return (
    <div id="shopsphere-admin-console" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Administrative Command
            </h1>
            <p className="text-xs text-gray-400 mt-1">Settle invoices, catalog assets, and packages</p>
          </div>
        </div>

        {/* Sync trigger */}
        <button
          onClick={loadAdminData}
          className="self-start md:self-auto flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 px-4 py-2 text-xs font-bold text-gray-750 dark:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Sheets
        </button>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        
        {/* Sales */}
        <div className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Gross Sales Turnover</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">₹{stats.totalSales.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Orders */}
        <div className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Completed Orders</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{stats.totalOrders}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Catalog */}
        <div className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Cataloged Assets</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{stats.totalProducts}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <PackageCheck className="h-5 w-5" />
          </div>
        </div>

        {/* AOV */}
        <div className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Average Order Value (AOV)</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">₹{stats.averageValue.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Tag className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Tabbed controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Rail */}
        <aside className="lg:col-span-3 bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-1 text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
              activeTab === "overview" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Operations Overview
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
              activeTab === "products" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            }`}
          >
            <PackageCheck className="h-4 w-4" /> Manage Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
              activeTab === "categories" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            }`}
          >
            <Layers className="h-4 w-4" /> Manage Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
              activeTab === "orders" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Package Shipments ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
              activeTab === "coupons" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            }`}
          >
            <Tag className="h-4 w-4" /> Coupon Promotions ({coupons.length})
          </button>
        </aside>

        {/* Workspace Display Area */}
        <main className="lg:col-span-9 bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm min-h-[500px]">
          
          {/* OVERVIEW SHEET */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Operations Performance Summary</h2>
                <p className="text-xs text-gray-400 mt-0.5">Quick distribution trends based on live records</p>
              </div>

              {/* Graphic distribution rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-900">
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-900 space-y-3.5 text-xs">
                  <h3 className="font-bold text-gray-850 dark:text-white flex items-center gap-1.5"><Layers className="h-4 w-4 text-indigo-600" /> Catalog Composition</h3>
                  <div className="space-y-2">
                    {categories.map((cat, i) => {
                      const count = products.filter((p) => p.category === cat.slug).length;
                      const percent = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-gray-500 font-semibold text-[11px]">
                            <span>{cat.name}</span>
                            <span>{count} items ({percent}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-900 space-y-3.5 text-xs">
                  <h3 className="font-bold text-gray-850 dark:text-white flex items-center gap-1.5"><ShoppingBag className="h-4 w-4 text-emerald-600" /> Package Shipping Milestones</h3>
                  <div className="space-y-2">
                    {["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => {
                      const count = orders.filter((o) => o.orderStatus === status).length;
                      const percent = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-gray-500 font-semibold text-[11px]">
                            <span>{status}</span>
                            <span>{count} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${status === "Delivered" ? "bg-emerald-500" : status === "Cancelled" ? "bg-rose-500" : "bg-indigo-600"}`} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Store Catalog Stock</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Edit price levels and warehouse reserves</p>
                </div>
                <button
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white font-bold px-3 py-2 text-xs"
                >
                  <Plus className="h-4 w-4" /> {showProductForm ? "Close Form" : "Create Product"}
                </button>
              </div>

              {/* Product Creation Form */}
              {showProductForm && (
                <form onSubmit={handleCreateProduct} className="space-y-4 p-5 rounded-2xl border border-indigo-150 bg-indigo-50/10 dark:border-indigo-900/30 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Product Display Name</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Brand</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Logitech"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Category</label>
                      <select
                        value={productForm.category}
                        required
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Retail Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Discount Percent (%)</label>
                      <input
                        type="number"
                        value={productForm.discount}
                        onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Warehouse Reserves (Stock)</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Image URLs (comma-separated for multi-image gallery)</label>
                      <input
                        type="text"
                        placeholder="e.g. URL1, URL2"
                        value={productForm.imageInput}
                        onChange={(e) => setProductForm({ ...productForm, imageInput: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Full Description</label>
                      <textarea
                        rows={3}
                        required
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 shadow-md">
                      Submit Product
                    </button>
                  </div>
                </form>
              )}

              {/* Products Sheet List */}
              <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-gray-850">
                <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-55 text-gray-700 dark:bg-gray-900 dark:text-gray-300 uppercase text-[9px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Asset Details</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3 text-right">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} className="border-b last:border-0 border-gray-150 dark:border-gray-850 hover:bg-gray-50/50">
                        <td className="px-4 py-3 flex gap-3 items-center">
                          <img src={p.images?.[0]} className="h-8 w-8 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold text-gray-800 dark:text-white block truncate max-w-[150px]">{p.name}</span>
                            <span className="text-[10px] text-gray-400 block uppercase">Brand: {p.brand}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 uppercase">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-gray-850 dark:text-white">₹{p.price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock > 10 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-750"}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* CATEGORIES MANAGEMENT */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Store Collections & Categories</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Classify products with custom tags and slugs</p>
                </div>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white font-bold px-3 py-2 text-xs"
                >
                  <Plus className="h-4 w-4" /> {showCategoryForm ? "Close Form" : "Create Category"}
                </button>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleCreateCategory} className="space-y-4 p-5 rounded-2xl border border-indigo-150 bg-indigo-50/10 dark:border-indigo-900/30 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Category Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ergonomic Mice"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Category Slug</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ergonomic-mice"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 shadow-md">
                      Register Category
                    </button>
                  </div>
                </form>
              )}

              {/* Categories table */}
              <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-gray-850">
                <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-55 text-gray-700 dark:bg-gray-900 dark:text-gray-300 uppercase text-[9px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3 text-right">Purge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id} className="border-b last:border-0 border-gray-150 dark:border-gray-850 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{c.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-500 text-[11px]">{c.slug}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteCategory(c._id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* PACKAGE SHIPMENTS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Active Package Shipments</h2>
                <p className="text-xs text-gray-400 mt-0.5">Route logistic tracking milestones on active client orders</p>
              </div>

              {/* Orders table */}
              <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-gray-850">
                <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-55 text-gray-700 dark:bg-gray-900 dark:text-gray-300 uppercase text-[9px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Order / Client</th>
                      <th className="px-4 py-3">Invoice Total</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Delivery Stage</th>
                      <th className="px-4 py-3 text-right">Update Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-b last:border-0 border-gray-150 dark:border-gray-850 hover:bg-gray-50/50 text-[11px]">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-gray-800 dark:text-white block">{o._id.substring(0, 10)}...</span>
                          <span className="text-[10px] text-gray-400 block">{o.userName} ({o.phoneNumber})</span>
                        </td>
                        <td className="px-4 py-3 font-black text-gray-900 dark:text-white">₹{o.grandTotal.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 uppercase font-bold">
                          <span className={o.paymentStatus === "paid" ? "text-emerald-500" : "text-amber-500"}>
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            o.orderStatus === "Delivered" ? "bg-emerald-50 text-emerald-700" : o.orderStatus === "Cancelled" ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1 text-[10px] outline-none font-bold text-gray-700 dark:text-white focus:border-indigo-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COUPONS PROMOTIONS */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Active Coupon Promotions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Configure discounts and minimum cart orders</p>
                </div>
                <button
                  onClick={() => setShowCouponForm(!showCouponForm)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white font-bold px-3 py-2 text-xs"
                >
                  <Plus className="h-4 w-4" /> {showCouponForm ? "Close Form" : "Create Coupon"}
                </button>
              </div>

              {showCouponForm && (
                <form onSubmit={handleCreateCoupon} className="space-y-4 p-5 rounded-2xl border border-indigo-150 bg-indigo-50/10 dark:border-indigo-900/30 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Promo Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WELCOME50"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Discount Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Value</label>
                      <input
                        type="number"
                        required
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Minimum Order Value (₹)</label>
                      <input
                        type="number"
                        required
                        value={couponForm.minOrderValue}
                        onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-500 uppercase">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 shadow-md">
                      Activate Promo Coupon
                    </button>
                  </div>
                </form>
              )}

              {/* Coupons table */}
              <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-gray-850">
                <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-55 text-gray-700 dark:bg-gray-900 dark:text-gray-300 uppercase text-[9px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Discount</th>
                      <th className="px-4 py-3">Min Order</th>
                      <th className="px-4 py-3">Expiry Date</th>
                      <th className="px-4 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c._id} className="border-b last:border-0 border-gray-150 dark:border-gray-850 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-800 dark:text-white uppercase text-[11px]">{c.code}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-500">
                          {c.discountType === "percentage" ? `${c.discountValue}% Off` : `₹${c.discountValue.toLocaleString("en-IN")} Off`}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-750 dark:text-gray-300">₹{c.minOrderValue.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-450">{new Date(c.expiryDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
