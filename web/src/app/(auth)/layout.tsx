import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Mistake</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            B2B Financial Leakage & Discrepancy Detection
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
