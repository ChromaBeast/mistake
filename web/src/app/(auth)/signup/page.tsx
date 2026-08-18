"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signup({ name, company_name: companyName, email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create tenant organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-foreground">
          Create Tenant Workspace
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Set up autonomous reconciliation for your supply chain in under 2 minutes.
        </p>
      </div>

      {/* Trust Callout */}
      <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Includes isolated tenant database & full 22-table audit schema.</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Your Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aditya Verma"
          required
        />

        <Input
          label="Company / Legal Entity Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Bharat Heavy Engineering Ltd"
          required
        />

        <Input
          label="Corporate Work Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.in"
          required
        />

        <Input
          label="Master Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" className="w-full h-10 font-semibold mt-2" isLoading={isLoading}>
          Create Account & Tenant
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Already have tenant credentials?{" "}
          <Link href="/login" className="text-foreground hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
