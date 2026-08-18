"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      setError(err instanceof Error ? err.message : "Failed to create tenant account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Create your tenant account</CardTitle>
        <CardDescription>
          Onboard your company to start detecting discrepancies in under 5 minutes.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
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
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.in"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account & Tenant
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
