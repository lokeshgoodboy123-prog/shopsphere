import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../context/AppContext.tsx";
import { IProduct, ICategory } from "../types.js";
import ProductCard from "../components/ProductCard.tsx";
import { ArrowRight, Tag, Star, Quote, ChevronRight, Zap, Sparkles } from "lucide-react";

export default function Home() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [latestProducts, setLatestProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
        ]);
        setCategories(catRes.data);
        
        // Featured = Products with rating >= 4.5
        const sorted = [...prodRes.data];
        setFeaturedProducts(sorted.filter((p) => p.rating >= 4.5).slice(0, 4));
        
        // Latest = Products sorted by newest
        setLatestProducts(
          sorted
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4)
        );
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "Marcus Aurelius",
      role: "Verified Buyer",
      comment: "ShopSphere's customer service and delivery pace are unparalleled. The Sonic Pro headphones are of absolute studio quality.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Elena Rostova",
      role: "Design Lead",
      comment: "I am extremely selective with office layouts. The ErgoComfort chair completely resolved my persistent posture strains. Worth every dollar.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Sarah Jenkins",
      role: "Fitness Instructor",
      comment: "My CoreGrip adjustable dumbbells replaced an entire stack of standard metal weights in my flat. Perfect engineering, seamless clicks.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-50/50 dark:bg-[#0B0F19]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div id="shopsphere-home" className="bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 dark:bg-[#0B0F19] sm:py-24 lg:py-32 border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Text details */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" /> Redefining Digital Shopping
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight font-display">
                Elevated Living.<br />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent dark:from-indigo-400 dark:via-indigo-300 dark:to-indigo-500">
                  Flawless Quality.
                </span>
              </h1>
              <p className="mt-6 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                Discover a curated orbit of state-of-the-art electronics, ergonomic workspaces, luxury timepieces, and clean beauty essentials. Engineered for those who appreciate premium craftsmanship.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-98"
                >
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#offers"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-750 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition-all active:scale-98"
                >
                  View Special Offers
                </a>
              </div>
            </div>

            {/* Visual showcase mockup */}
            <div className="mt-12 lg:col-span-6 lg:mt-0 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800/80">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
                    alt="Sonic Pro Wireless Headphones"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800/85 flex items-center gap-3 animate-bounce">
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sonic Pro Release</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Save up to 15%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Top Categories Bento Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl tracking-tight font-display">
              Shop by Category
            </h2>
            <p className="text-xs text-slate-400 mt-1">Sourced from the finest materials globally</p>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            All categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 3).map((cat, index) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl dark:border-slate-800/80 dark:bg-[#111827] transition-all duration-300 ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="aspect-[16/10] sm:aspect-[2/1] lg:aspect-[16/9] w-full overflow-hidden bg-slate-50 dark:bg-slate-900/30">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 p-6">
                <h3 className="text-xl font-bold text-white font-display">{cat.name}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white dark:bg-[#0B0F19] border-y border-slate-100 dark:border-slate-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                Top Rated Picks
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl tracking-tight mt-1 font-display">
                Featured Products
              </h2>
            </div>
            <Link to="/products?sort=popularity" className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Offer Section / Coupon Reveal */}
      <section id="offers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-indigo-850 py-12 px-8 sm:px-12 sm:py-16 shadow-2xl border border-indigo-950/20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-300">
              <Tag className="h-3.5 w-3.5" /> Limited Time Coupons Available
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl tracking-tight leading-none font-display">
              Save Big on Your First Spherical Premium Purchase
            </h2>
            <p className="mt-4 text-sm text-indigo-200 leading-relaxed">
              Use code <strong className="text-white bg-white/10 px-2.5 py-1 rounded-md font-mono text-base border border-white/15">SPHERE15</strong> at shopping checkout to enjoy an instant 15% reduction across our complete design workspace and electronics catalog.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/products"
                className="rounded-full bg-white px-8 py-3 text-xs font-bold text-indigo-950 shadow-md hover:bg-slate-100 transition-all active:scale-98"
              >
                Claim Coupon Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Launches */}
      <section className="bg-white dark:bg-[#0B0F19] border-t border-slate-100 dark:border-slate-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                Fresh Off The Line
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl tracking-tight mt-1 font-display">
                Latest Launches
              </h2>
            </div>
            <Link to="/products?sort=newest" className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-900">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
            What Our Patrons Say
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
            Endorsed by Global Connoisseurs
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-[#111827] dark:border-slate-800/80 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex gap-1 mb-4 text-amber-400">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  "{test.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                    {test.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">{test.role}</span>
                </div>
                <Quote className="h-6 w-6 text-indigo-50 dark:text-indigo-950/40 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
