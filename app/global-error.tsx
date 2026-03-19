"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 text-center bg-background">
          <div className="p-6 bg-red-500/10 rounded-full ring-8 ring-red-500/10">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Fatal Application Error</h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              A critical error occurred that prevented the application layout from rendering.
            </p>
            {error.message && (
              <div className="mt-4 p-4 bg-muted border border-border rounded-xl text-left shadow-sm">
                <code className="text-sm text-red-500 font-mono break-all">{error.message}</code>
              </div>
            )}
          </div>
          <button
            onClick={() => reset()}
            className="mt-4 px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 active:scale-95 transition-all shadow-lg"
          >
            Try reloading the page
          </button>
        </div>
      </body>
    </html>
  );
}
