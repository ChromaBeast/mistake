import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center space-y-5 max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          404 — Record Not Found
        </p>
        <h1 className="text-3xl font-bold font-serif tracking-tight text-foreground">
          This page left no evidence.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The record you are looking for does not exist, was purged under a
          retention policy, or never made it past the ingestion gate.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
