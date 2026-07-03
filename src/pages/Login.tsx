import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const { user, login, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : "/");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both email and password.", "warning");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast("Logged in successfully! Welcome to ShopSphere.", "success");
    } catch {
      // errors are handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[80vh] flex flex-col justify-center transition-colors duration-300">
      
      <div className="bg-white dark:bg-gray-950 p-8 sm:p-10 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-6">
        
        {/* Brand logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/15">
            S
          </div>
          <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">
            Sign In to ShopSphere
          </h1>
          <p className="text-xs text-gray-400">Securely enter your catalog credentials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. customer@shopsphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 shadow-lg shadow-indigo-600/10 transition-all active:scale-98 disabled:opacity-55"
          >
            {loading ? "Authenticating..." : "Sign In Account"} <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        {/* Demo hints */}
        <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20 text-[11px] text-indigo-700 leading-relaxed dark:border-indigo-900/30 dark:bg-indigo-950/10 dark:text-indigo-400">
          <p className="font-bold mb-1">💡 Sandbox Demo Credentials:</p>
          <ul className="space-y-0.5 list-disc pl-4">
            <li>Customer Account: <code className="font-mono bg-indigo-50 dark:bg-indigo-900 px-1 rounded">user@shopsphere.com</code> / <code className="font-mono bg-indigo-50 dark:bg-indigo-900 px-1 rounded">password</code></li>
            <li>Admin Account: <code className="font-mono bg-indigo-50 dark:bg-indigo-900 px-1 rounded">admin@shopsphere.com</code> / <code className="font-mono bg-indigo-50 dark:bg-indigo-900 px-1 rounded">password</code></li>
          </ul>
        </div>

        {/* Register link */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-400">
            Don't have an account yet?{" "}
            <Link to={redirect ? `/register?redirect=${redirect}` : "/register"} className="font-bold text-indigo-600 hover:text-indigo-500">
              Register / Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
