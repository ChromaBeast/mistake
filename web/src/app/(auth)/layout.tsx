import React from "react";
import Link from "next/link";
import { AuthAuthorityHero } from "@/components/auth/AuthAuthorityHero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Brand Authority Column (Desktop) */}
      <AuthAuthorityHero />

      {/* Right Form Viewport */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex lg:hidden items-center justify-between pb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-serif font-bold text-base">
              M
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">
              Mistake
            </span>
          </Link>
        </div>

        {/* Center Auth Card Content */}
        <div className="my-auto w-full max-w-md mx-auto py-8">
          {children}
        </div>

        {/* Form Footer */}
        <div className="pt-6 text-center text-xs text-muted-foreground">
          <span>Deterministic financial reconciliation for enterprise supply chains.</span>
        </div>
      </div>
    </div>
  );
}
