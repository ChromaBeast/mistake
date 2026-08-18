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
  isLoading?: boolean;
}

export function TenantProfileForm({ tenant, onSave, isLoading }: TenantProfileFormProps) {
  const [name, setName] = useState(tenant.name);
  const [legalName, setLegalName] = useState(tenant.legal_name || "");
  const [gstin, setGstin] = useState(tenant.gstin || "");
  const [industry, setIndustry] = useState(tenant.industry || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ name, legal_name: legalName, gstin, industry });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
          <Button size="sm" type="submit" isLoading={isLoading} className="ml-auto">
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
