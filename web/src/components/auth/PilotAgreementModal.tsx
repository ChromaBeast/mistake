"use client";

import React, { useState } from "react";
import { ShieldCheck, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PilotAgreementModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function PilotAgreementModal({ isOpen, onAccept }: PilotAgreementModalProps) {
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryEmail, setSignatoryEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !signatoryName || !signatoryEmail) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/proxy/api/v1/tenant/pilot-agreement/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatory_name: signatoryName,
          signatory_email: signatoryEmail,
          agreement_version: "v2.0-pilot-dpa",
          retention_days: 30,
        }),
      });
    } catch {
      // Continue for mock/offline
    } finally {
      setIsSubmitting(false);
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center space-x-3 text-primary">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Pilot Data Handling Agreement (PDHA)</h3>
            <p className="text-xs text-muted-foreground">Required before uploading real financial records</p>
          </div>
        </div>

        <div className="p-3.5 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground space-y-2 max-h-48 overflow-y-auto">
          <p className="font-semibold text-foreground">Pilot Program Terms Summary:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Retention & Purge:</strong> Uploaded pilot records are retained strictly during the active 4-week evaluation window and purged within 30 days of completion.</li>
            <li><strong>Tenant Isolation:</strong> Data is isolated via strict per-tenant database keys and never commingled.</li>
            <li><strong>AI Confidentiality:</strong> Uploaded financial data is never used to train global public AI models.</li>
            <li><strong>Security:</strong> All uploads are encrypted at rest with AES-256 and in transit via TLS 1.3.</li>
          </ul>
        </div>

        <form onSubmit={handleAccept} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Authorized Signatory Name</label>
              <input
                required
                type="text"
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                placeholder="e.g. Vikram Sharma"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Signatory Email</label>
              <input
                required
                type="email"
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                placeholder="e.g. vikram@company.in"
                value={signatoryEmail}
                onChange={(e) => setSignatoryEmail(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-start space-x-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">
              I confirm I am authorized to bind our organization to the Mistake Pilot Data Handling Agreement.
            </span>
          </label>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!agreed || !signatoryName || !signatoryEmail || isSubmitting}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Accept & Proceed to Upload</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
