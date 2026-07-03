import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { IUser, ICartItem, IProduct, ICoupon, IAddress } from "../types.js";

// Axios Config with Interceptors
export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopsphere_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface IToast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface AppContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  theme: "light" | "dark";
  toasts: IToast[];
  cart: ICartItem[];
  wishlistIds: string[];
  appliedCoupon: ICoupon | null;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password?: string) => Promise<any>;
  logout: (silent?: boolean) => void;
  toggleTheme: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  addAddress: (address: Omit<IAddress, "_id" | "isDefault">) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, qty: number) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  applyCouponCode: (code: string) => Promise<void>;
  removeCouponCode: () => void;
  clearCart: () => void;
  syncCartWithBackend: () => Promise<void>;
  fetchWishlist: () => Promise<IProduct[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("shopsphere_token"));
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark">((localStorage.getItem("shopsphere_theme") as "light" | "dark") || "light");
  const [toasts, setToasts] = useState<IToast[]>([]);
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("shopsphere_theme", theme);
  }, [theme]);

  // Toast System
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch current user details
  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
      setCart(res.data.cart || []);
      setWishlistIds(res.data.wishlist || []);
    } catch (err: any) {
      console.warn("Failed to restore session gracefully:", err.message || err);
      logout(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // AUTH ACTIONS
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("shopsphere_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setCart(res.data.user.cart || []);
      setWishlistIds(res.data.user.wishlist || []);
      showToast(`Welcome back, ${res.data.user.name}!`, "success");
      return res.data.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials.";
      showToast(msg, "error");
      throw err;
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    try {
      // In seed mode we also expect password, so we use default 'password123' if they omit it in forms
      const res = await api.post("/auth/register", { name, email, password: password || "password123" });
      localStorage.setItem("shopsphere_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setCart(res.data.user.cart || []);
      setWishlistIds(res.data.user.wishlist || []);
      showToast(`Account registered successfully! Welcome ${name}.`, "success");
      return res.data.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed.";
      showToast(msg, "error");
      throw err;
    }
  };

  const logout = (silent: boolean = false) => {
    localStorage.removeItem("shopsphere_token");
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlistIds([]);
    setAppliedCoupon(null);
    if (!silent) {
      showToast("Signed out successfully.", "info");
    }
  };

  // PROFILE MANAGEMENT
  const updateProfile = async (name: string, email: string) => {
    try {
      const res = await api.put("/auth/profile", { name, email });
      setUser(res.data.user);
      showToast("Profile details updated.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Profile update failed.", "error");
    }
  };

  const changePassword = async (current: string, next: string) => {
    try {
      await api.put("/auth/profile/password", { currentPassword: current, newPassword: next });
      showToast("Password updated successfully.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Password change failed.", "error");
      throw err;
    }
  };

  const addAddress = async (address: Omit<IAddress, "_id" | "isDefault">) => {
    try {
      const res = await api.post("/auth/profile/address", address);
      if (user) {
        setUser({ ...user, addresses: res.data.addresses });
      }
      showToast("Delivery address added.", "success");
    } catch (err: any) {
      showToast("Failed to add address.", "error");
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await api.delete(`/auth/profile/address/${id}`);
      if (user) {
        setUser({ ...user, addresses: res.data.addresses });
      }
      showToast("Address deleted.", "info");
    } catch (err: any) {
      showToast("Failed to delete address.", "error");
    }
  };

  // CART OPERATIONS
  const syncCartWithBackend = async () => {
    // optional helper to ensure sync
  };

  const addToCart = async (productId: string, qty: number = 1) => {
    if (!token) {
      showToast("Please log in to manage your shopping cart.", "warning");
      return;
    }

    try {
      const existing = cart.find((item) => item.productId === productId);
      const nextQty = existing ? existing.quantity + qty : qty;

      const res = await api.post("/cart", { productId, quantity: nextQty });
      setCart(res.data.cart);
      showToast("Product added to cart.", "success");
    } catch (err: any) {
      showToast("Failed to add item to cart.", "error");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data.cart);
      showToast("Item removed from cart.", "info");
    } catch (err: any) {
      showToast("Failed to remove item.", "error");
    }
  };

  const updateCartQuantity = async (productId: string, qty: number) => {
    try {
      const res = await api.post("/cart", { productId, quantity: qty });
      setCart(res.data.cart);
    } catch (err: any) {
      showToast("Failed to update quantity.", "error");
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // WISHLIST OPERATIONS
  const toggleWishlist = async (productId: string) => {
    if (!token) {
      showToast("Please log in to manage your wishlist.", "warning");
      return;
    }
    try {
      const res = await api.post("/wishlist", { productId });
      setWishlistIds(res.data.wishlist);
      const isFav = res.data.wishlist.includes(productId);
      showToast(isFav ? "Added to Wishlist." : "Removed from Wishlist.", "success");
    } catch (err: any) {
      showToast("Failed to update wishlist.", "error");
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      return res.data;
    } catch {
      return [];
    }
  };

  // DISCOUNT COUPONS
  const applyCouponCode = async (code: string) => {
    try {
      const res = await api.get(`/coupons/validate/${code}`);
      setAppliedCoupon(res.data);
      showToast(`Coupon '${code.toUpperCase()}' applied successfully!`, "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Invalid coupon code.", "error");
      throw err;
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toasts,
        cart,
        wishlistIds,
        appliedCoupon,
        showToast,
        removeToast,
        login,
        register,
        logout,
        toggleTheme,
        updateProfile,
        changePassword,
        addAddress,
        deleteAddress,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        applyCouponCode,
        removeCouponCode,
        clearCart,
        syncCartWithBackend,
        fetchWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
}
