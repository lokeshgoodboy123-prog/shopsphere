import { useApp } from "../context/AppContext.tsx";
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div id="shopsphere-toasts" className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const bgClass =
          toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-850"
            : toast.type === "error"
              ? "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-850"
              : toast.type === "warning"
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-850"
                : "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-850";

        const textClass =
          toast.type === "success"
            ? "text-emerald-800 dark:text-emerald-300"
            : toast.type === "error"
              ? "text-rose-800 dark:text-rose-300"
              : toast.type === "warning"
                ? "text-amber-800 dark:text-amber-300"
                : "text-blue-800 dark:text-blue-300";

        const Icon =
          toast.type === "success"
            ? CheckCircle
            : toast.type === "error"
              ? AlertOctagon
              : toast.type === "warning"
                ? AlertTriangle
                : Info;

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md animate-slide-in transition-all duration-300 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${textClass}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${textClass}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
