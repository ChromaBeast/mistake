"use client";

import { useEffect } from "react";

/** Auth route segment error boundary. */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <h2 className="text-base font-semibold text-foreground">Authentication error</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
