"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center w-full">
      <div className="p-4 bg-red-500/10 rounded-full animate-pulse ring-4 ring-red-500/10">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground tracking-tight">Something went wrong!</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        An unexpected error occurred. Our team has been notified.
        {error.message && (
          <span className="block mt-2 text-xs opacity-50 font-mono bg-muted p-2 rounded-md break-words">
            {error.message}
          </span>
        )}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-sm"
      >
        Try again
      </button>
    </div>
  );
}
