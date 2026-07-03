import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import { IProduct } from "../types.js";
import ProductCard from "../components/ProductCard.tsx";
import { Heart, Sparkles } from "lucide-react";

export default function Wishlist() {
  const { wishlistIds, fetchWishlist } = useApp();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      setLoading(true);
      const data = await fetchWishlist();
      setProducts(data);
      setLoading(false);
    }
    loadWishlist();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-rose-50 dark:bg-rose-950/40 p-6 mb-4">
          <Heart className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl tracking-tight">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
          Keep track of luxury items, workspace pieces, and seasonal deals by clicking the heart badge. They will appear here instantly.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-98"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div id="shopsphere-wishlist" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
      <div className="flex items-center gap-2 mb-8">
        <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
          <Heart className="h-5 w-5 text-rose-500 fill-current" />
        </span>
        <div>
          <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs text-gray-400 mt-1">Saved items you are watching</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
