import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div id="not-found-screen" className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-950 min-h-[70vh] flex flex-col justify-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-950 p-8 sm:p-10 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm text-center space-y-6">
        
        {/* Warning Badge */}
        <div className="mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/40 p-4 w-20 h-20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Compass className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div>
          <h1 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight">404</h1>
          <h2 className="text-lg font-black text-gray-800 dark:text-white mt-2">Page Not Found</h2>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
            The workspace navigation coordinates entered are stale or pointing to unregistered routes.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-900">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xs py-3.5 shadow-md"
          >
            Go to Homepage <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
