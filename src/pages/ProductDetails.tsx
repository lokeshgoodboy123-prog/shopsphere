import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp, api } from "../context/AppContext.tsx";
import { IProduct, IReview } from "../types.js";
import ProductCard from "../components/ProductCard.tsx";
import { Star, Heart, ShoppingBag, Plus, Minus, Send, Trash2, Tag, ArrowLeft } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToCart, toggleWishlist, wishlistIds, showToast } = useApp();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [related, setRelated] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery Active Image
  const [activeImage, setActiveImage] = useState("");

  // Buy Quantity State
  const [quantity, setQuantity] = useState(1);

  // New Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [postingReview, setPostingReview] = useState(false);

  useEffect(() => {
    async function loadProductDetail() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        setRelated(res.data.related || []);
        if (res.data.product.images?.length > 0) {
          setActiveImage(res.data.product.images[0]);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        showToast("Product not found.", "error");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const isFav = wishlistIds.includes(product._id);
  const finalPrice = product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleQtyChange = (val: number) => {
    const next = quantity + val;
    if (next >= 1 && next <= product.stock) {
      setQuantity(next);
    }
  };

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product._id, quantity);
    navigate("/checkout");
  };

  // Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to post a review.", "warning");
      return;
    }
    if (!reviewComment.trim()) {
      showToast("Review description is required.", "warning");
      return;
    }

    setPostingReview(true);
    try {
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setProduct({
        ...product,
        reviews: res.data.reviews,
        rating: res.data.avgRating,
      });
      setReviewComment("");
      showToast("Thank you! Review posted successfully.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to post review.", "error");
    } finally {
      setPostingReview(false);
    }
  };

  // Delete Review
  const handleReviewDelete = async (reviewId: string) => {
    try {
      const res = await api.delete(`/products/${product._id}/reviews/${reviewId}`);
      setProduct({
        ...product,
        reviews: res.data.reviews,
        rating: res.data.avgRating,
      });
      showToast("Review deleted.", "info");
    } catch (err) {
      showToast("Failed to delete review.", "error");
    }
  };

  return (
    <div id={`shopsphere-product-${product._id}`} className="bg-[#F8FAFC] dark:bg-[#0B0F19] min-h-screen pb-16 transition-colors duration-300">
      
      {/* breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
          <ArrowLeft className="h-4 w-4" /> Return to Catalog
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
          
          {/* Gallery Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900/30 dark:border-slate-800">
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Thumbnail selector */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border-2 transition-all ${
                      activeImage === img ? "border-indigo-600 scale-95" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 uppercase tracking-wider">
                  {product.brand}
                </span>
                
                {/* Stock alert badge */}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.stock > 10
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : product.stock > 0
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                }`}>
                  {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} Left` : "Out of Stock"}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl tracking-tight leading-snug font-display">
                {product.name}
              </h1>

              {/* Star details summary */}
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(product.rating) ? "fill-current" : ""}`} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {product.rating} ({product.reviews?.length || 0} customer reviews)
                </span>
              </div>

              {/* Price details box */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850">
                {product.discount > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">₹{finalPrice.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-slate-400 line-through font-mono">₹{product.price.toLocaleString("en-IN")}</span>
                    <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {product.discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">₹{product.price.toLocaleString("en-IN")}</span>
                )}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-800/60 space-y-4">
              
              {/* Quantity selectors */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400">SELECT QUANTITY</span>
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-full bg-white dark:bg-slate-900 p-1">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      className="p-1.5 rounded-full text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Decrease Quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-mono font-bold text-slate-800 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => handleQtyChange(1)}
                      className="p-1.5 rounded-full text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Increase Quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-slate-50 text-slate-850 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-transparent font-bold text-sm py-3.5 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:hover:bg-indigo-600"
                >
                  <ShoppingBag className="h-4.5 w-4.5" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-sm py-3.5 shadow-lg shadow-indigo-600/10 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all active:scale-95 ${
                    isFav
                      ? "border-rose-200 text-rose-500 bg-rose-50/50"
                      : "border-slate-200 text-slate-400 hover:text-rose-500 dark:border-slate-800 hover:bg-slate-50/50"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Specifications box */}
            {product.specifications?.length > 0 && (
              <div className="mt-8 border-t border-slate-150 dark:border-slate-800/60 pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Specifications</h3>
                <div className="overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800/80">
                  <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className="border-b last:border-0 border-slate-150 dark:border-slate-800/80">
                          <td className="bg-slate-50 dark:bg-slate-900/30 px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 w-1/3">
                            {spec.name}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl tracking-tight font-display">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Review submit form */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Submit Your Star Rating</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-850">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Review Description</label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your detailed experience with this product..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postingReview}
                    className="w-full flex items-center justify-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-55"
                  >
                    <Send className="h-3.5 w-3.5" /> {postingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-100 text-center dark:bg-amber-950/10 dark:border-amber-900">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                    Please register or sign in to share a product review.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block mt-4 rounded-full bg-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-505"
                  >
                    Login / Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Right Box: Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {product.reviews?.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {product.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between bg-slate-50/20 dark:bg-slate-900/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rev.userName}</h4>
                          <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5">
                        {rev.comment}
                      </p>

                      {/* Delete button (only show for review author or admin) */}
                      {(user && (user._id === rev.userId || user.role === "admin")) && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleReviewDelete(rev._id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-500"
                          >
                            <Trash2 className="h-3 w-3" /> Delete Review
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Related Products section */}
        {related.length > 0 && (
          <section className="mt-16 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl tracking-tight font-display">
                Related Products
              </h2>
              <p className="text-xs text-slate-400">Discover other beautiful picks in this category</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
