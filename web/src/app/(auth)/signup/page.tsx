"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[score] };
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signup({
        name: name.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        password,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create tenant organization");
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColors = [
    "bg-rose-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-500",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Get started with automated reconciliation in under 2 minutes.
        </p>
      </div>

      {/* Trust Callout */}
      <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Includes dedicated tenant database & full 22-table audit schema.</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Your Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aditya Verma"
          autoComplete="name"
          required
        />

        <Input
          label="Company / Legal Entity Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Bharat Heavy Engineering Ltd"
          autoComplete="organization"
          required
        />

        <Input
          label="Work Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.in"
          autoComplete="username"
          error={email.length > 0 && !email.includes("@") ? "Enter a valid work email address." : undefined}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            helperText={
              password.length > 0 && password.length < 8
                ? `${8 - password.length} more character${8 - password.length === 1 ? "" : "s"} required`
                : undefined
            }
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-[30px] p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {password.length > 0 && (
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < strength.score ? strengthColors[strength.score] : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">
              {strength.label}
            </span>
          </div>
        )}

        <Button type="submit" className="w-full h-10 font-semibold mt-2" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
