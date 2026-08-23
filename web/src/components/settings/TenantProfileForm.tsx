"use client";

import React, { useState } from "react";
import { Tenant } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Building2, Check } from "lucide-react";

interface TenantProfileFormProps {
  tenant: Tenant;
  onSave: (data: Partial<Tenant>) => Promise<void>;
}

export function TenantProfileForm({ tenant, onSave }: TenantProfileFormProps) {
  const [name, setName] = useState(tenant.name);
  const [legalName, setLegalName] = useState(tenant.legal_name || "");
  const [gstin, setGstin] = useState(tenant.gstin || "");
  const [industry, setIndustry] = useState(tenant.industry || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GSTIN: 15 chars — 2 digits + 10 char PAN + entity code + Z + checksum
  const gstinValid = gstin === "" || /^\d{2}[A-Z0-9]{13}$/.test(gstin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!gstinValid) return;
    setError(null);
    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), legal_name: legalName.trim(), gstin: gstin.trim(), industry: industry.trim() });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The profile could not be saved. Try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span>Organization & Tax Profile</span>
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="text-xs text-rose-500 px-1">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Legal Entity Name"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
            <Input
              label="GSTIN (India GST Identifier)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27AAACT2727Q1ZW"
              maxLength={15}
              error={
                !gstinValid
                  ? "GSTIN must be 15 characters: 2 digits + PAN + entity code + Z + checksum."
                  : undefined
              }
            />
            <Input
              label="Industry Sector"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Manufacturing & Logistics"
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
          {savedSuccess && (
            <span className="text-xs font-medium text-emerald-500 flex items-center space-x-1">
              <Check className="h-3.5 w-3.5" />
              <span>Profile updated successfully</span>
            </span>
          )}
          <Button size="sm" type="submit" isLoading={isSaving} disabled={!name.trim() || !gstinValid} className="ml-auto">
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
