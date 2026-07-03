import { Link } from "react-router-dom";
import { AlertOctagon, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";

export default function PaymentFailed() {
  return (
    <div id="payment-failed-screen" className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[70vh] flex flex-col justify-center transition-colors duration-300">
      
      <div className="bg-white dark:bg-gray-950 p-8 sm:p-10 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm text-center space-y-6">
        
        {/* Warning Icon */}
        <div className="mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 p-4 w-20 h-20 flex items-center justify-center shadow-lg shadow-rose-500/10">
          <AlertOctagon className="h-12 w-12 text-rose-500" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">
            Transaction Declined / Failed
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            The payment gateway was unable to settle your account invoice. No funds have been deducted from your card.
          </p>
        </div>

        {/* Diagnostic info */}
        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/10 text-xs text-left text-gray-500 leading-relaxed space-y-2">
          <h4 className="font-bold text-gray-700 dark:text-rose-400 flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" /> Possible Causes:
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Incorrect card numbers, CVVs, or expirations entered.</li>
            <li>Insufficient balance or credit limits reached.</li>
            <li>Network timeout during bank verification handshakes.</li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
          <Link
            to="/cart"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xs py-3.5 shadow-md"
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" /> Re-attempt Payment
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-750 font-bold text-xs py-3.5 dark:border-gray-800 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" /> Home Page
          </Link>
        </div>

      </div>
    </div>
  );
}
