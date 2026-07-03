import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { IProduct } from "../types.js";

export default function ProductCard({ product }: { product: IProduct; key?: any }) {
  const { addToCart, toggleWishlist, wishlistIds } = useApp();

  const isWishlisted = wishlistIds.includes(product._id);

  // Price calculations
  const hasDiscount = product.discount > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div
      id={`product-card-${product._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl dark:border-slate-800/80 dark:bg-[#111827] transition-all duration-300"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold text-white shadow-md shadow-rose-500/20">
            -{product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-95 ${
            isWishlisted
              ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
              : "text-slate-400 hover:text-rose-500 hover:bg-white"
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
            {product.brand}
          </span>
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{product.rating}</span>
          </div>
        </div>

        <Link to={`/products/${product._id}`} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex-grow">
          {product.description}
        </p>

        {/* Pricing & CTA */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-mono text-slate-400 line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product._id, 1);
            }}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
              product.stock === 0
                ? "bg-slate-150 text-slate-400 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stock === 0 ? "Out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
