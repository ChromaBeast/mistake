import React from "react";
import Link from "next/link";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const PRODUCT_LINKS = [
  { href: "/#features", label: "Leak Vectors" },
  { href: "/#calculator", label: "Spend Calculator" },
  { href: "/#industries", label: "Industries" },
  { href: "/#architecture", label: "ERP Integration" },
];

const COMPANY_LINKS = [
  { href: "/#contact", label: "Request Audit" },
  { href: "mailto:hello@sheershjaiswal.in", label: "hello@sheershjaiswal.in" },
  { href: "/login", label: "Sign In" },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/legal/terms-of-service", label: "Terms of Service" },
  { href: "/legal/data-processing-agreement", label: "Data Processing Agreement" },
];

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-border/40">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs font-serif">
                M
              </div>
              <span className="font-bold tracking-tight text-foreground text-sm font-serif">
                Mistake
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[26ch]">
              Evidence-backed B2B financial leakage detection at paise-exact accuracy.
            </p>
            <a
              href="https://github.com/ChromaBeast/mistake"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitHubMark className="w-3.5 h-3.5" /> Open Source
            </a>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {COMPANY_LINKS.map((link) =>
                link.href.startsWith("/") ? (
                  <li key={link.label}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ) : (
                  <li key={link.label}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors break-all">
                      {link.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
          <div>© 2026 Mistake Platform. Built with Exact INR Paise Arithmetic.</div>
          <div className="text-center sm:text-right">
            Controls aligned to SOC 2 &amp; ISO 27001 frameworks • GSTR-2B Reconciled
          </div>
        </div>
      </div>
    </footer>
  );
}
