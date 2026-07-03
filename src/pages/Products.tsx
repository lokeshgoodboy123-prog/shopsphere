import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../context/AppContext.tsx";
import { IProduct, ICategory } from "../types.js";
import ProductCard from "../components/ProductCard.tsx";
import { SlidersHorizontal, Search, Star, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States synced with Search Parameters
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const selectedBrand = searchParams.get("brand") || "all";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("rating") || "";
  const sortBy = searchParams.get("sort") || "popularity";
  const inStockOnly = searchParams.get("inStock") === "true";

  // UI state for mobile filters drawer
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Available unique brands compiled from current products
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
        ]);
        setCategories(catRes.data);

        // Fetch all unique brands for filter listings
        const uniqueBrands = Array.from(new Set(prodRes.data.map((p: any) => p.brand))) as string[];
        setBrands(uniqueBrands);
      } catch (err) {
        console.error("Failed to load catalog filter dependencies:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
        if (selectedBrand && selectedBrand !== "all") params.append("brand", selectedBrand);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (minRating) params.append("rating", minRating);
        if (sortBy) params.append("sort", sortBy);

        const res = await api.get(`/products?${params.toString()}`);
        let list = res.data as IProduct[];

        if (inStockOnly) {
          list = list.filter((p) => p.stock > 0);
        }

        setProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, minRating, sortBy, inStockOnly]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "false") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setShowMobileFilters(false);
  };

  return (
    <div id="shopsphere-catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0B0F19] min-h-screen transition-colors duration-300">
      
      {/* Header and counter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
            Shop Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {products.length} {products.length === 1 ? "item" : "items"} matching your custom filters
          </p>
        </div>

        {/* Sort and mobile toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 focus:outline-none"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest Launch</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm font-display">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Filters
            </h3>
            <button onClick={clearFilters} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Reset All
            </button>
          </div>

          {/* Search bar internally inside sidebar */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type brand, details..."
                value={searchQuery}
                onChange={(e) => updateParam("search", e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50 py-2 pl-3 pr-8 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-205"
              />
              <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Categories select list */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection / Category</label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => updateParam("category", "all")}
                className={`text-xs text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between transition-colors ${
                  selectedCategory === "all"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/40"
                }`}
              >
                <span>All Collections</span>
                <Layers className="h-3.5 w-3.5" />
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam("category", cat.slug)}
                  className={`text-xs text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/40"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands list */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brands</label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => updateParam("brand", "all")}
                className={`text-xs text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between transition-colors ${
                  selectedBrand === "all"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/40"
                }`}
              >
                <span>All Brands</span>
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => updateParam("brand", brand)}
                  className={`text-xs text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between transition-colors ${
                    selectedBrand.toLowerCase() === brand.toLowerCase()
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/40"
                  }`}
                >
                  <span>{brand}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range inputs */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price Bounds ($)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParam("minPrice", e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 outline-none text-center font-mono focus:border-indigo-500"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParam("maxPrice", e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 outline-none text-center font-mono focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minimum Rating</label>
            <div className="flex flex-col gap-1">
              {[4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateParam("rating", stars.toString())}
                  className={`text-xs text-left px-2 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                    minRating === stars.toString()
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900/45"
                  }`}
                >
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < stars ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="font-semibold">& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="space-y-2 pt-3 border-t border-slate-150 dark:border-slate-800/60">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParam("inStock", e.target.checked ? "true" : "false")}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800"
              />
              <span className="text-xs font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> In-Stock Only
              </span>
            </label>
          </div>
        </aside>

        {/* Catalog grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="flex h-[50vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80 rounded-2xl h-[50vh] shadow-sm">
              <SlidersHorizontal className="h-10 w-10 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">We couldn't locate any products matching your specific query bounds. Try shifting your bounds or resetting selectors.</p>
              <button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-950 py-4 pb-12 shadow-xl animate-slide-in">
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-900">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Active Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>

            <div className="p-4 space-y-6">
              {/* Reset inside mobile */}
              <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-bold text-gray-800 dark:bg-gray-900 dark:text-white">
                <RefreshCw className="h-3.5 w-3.5" /> Clear All
              </button>

              {/* Mobile details category list */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collections</h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { updateParam("category", "all"); setShowMobileFilters(false); }}
                    className={`text-xs text-left px-2 py-1.5 rounded-lg ${selectedCategory === "all" ? "bg-indigo-50 text-indigo-600" : "text-gray-700"}`}
                  >
                    All Collections
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { updateParam("category", cat.slug); setShowMobileFilters(false); }}
                      className={`text-xs text-left px-2 py-1.5 rounded-lg ${selectedCategory === cat.slug ? "bg-indigo-50 text-indigo-600" : "text-gray-750"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile details brand list */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brands</h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { updateParam("brand", "all"); setShowMobileFilters(false); }}
                    className={`text-xs text-left px-2 py-1.5 rounded-lg ${selectedBrand === "all" ? "bg-indigo-50 text-indigo-600" : "text-gray-700"}`}
                  >
                    All Brands
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => { updateParam("brand", brand); setShowMobileFilters(false); }}
                      className={`text-xs text-left px-2 py-1.5 rounded-lg ${selectedBrand === brand ? "bg-indigo-50 text-indigo-600" : "text-gray-750"}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
