"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

interface MfaStepProps {
  mfaToken: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MfaStep({ mfaToken, onSuccess, onCancel }: MfaStepProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyMfa } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await verifyMfa({ mfa_token: mfaToken, code: code.trim() });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid MFA verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="flex items-center space-x-2 text-primary p-3 rounded-lg bg-primary/5 border border-primary/20">
        <ShieldCheck className="h-5 w-5 flex-shrink-0" />
        <p className="text-xs text-foreground font-medium">
          Two-Factor Authentication is enabled for your enterprise account.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      <Input
        label="6-Digit Authenticator Code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        className="font-mono text-center tracking-widest text-lg"
        required
        autoFocus
      />

      <div className="space-y-2 pt-2">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Verify & Sign In
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full text-xs flex items-center justify-center space-x-1.5"
          onClick={onCancel}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Password Login</span>
        </Button>
      </div>
    </form>
  );
}
