"use client";

import { useEffect } from "react";

/** Dashboard route segment error boundary. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="p-8">
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
        <h2 className="text-base font-semibold text-foreground">Failed to load page</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
