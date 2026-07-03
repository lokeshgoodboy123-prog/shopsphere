import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext.tsx";

export default function ForgotPassword() {
  const { showToast } = useApp();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast("Reset password email simulator triggered.", "info");
    }, 1200);
  };

  return (
    <div id="forgot-password-container" className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[70vh] flex flex-col justify-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-950 p-8 sm:p-10 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-6">
        
        {submitted ? (
          <div className="text-center space-y-5">
            <div className="mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-4 w-16 h-16 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Verification Link Dispatched</h2>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                We've dispatched a recovery handshake token to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>. Check your spam folders if the verification code does not arrive in 2 minutes.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-900">
              <Link to="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Log In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">Recover Password</h1>
              <p className="text-xs text-gray-400">Enter your registered email address to restore credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-wider">Account Email</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 shadow-lg shadow-indigo-600/10 transition-all active:scale-98 disabled:opacity-55"
              >
                <Send className="h-3.5 w-3.5" /> {loading ? "Dispatching..." : "Send Verification Token"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-900">
              <Link to="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Return to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
