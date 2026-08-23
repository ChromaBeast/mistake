"use client";

import React, { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface PilotAgreementModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function PilotAgreementModal({ isOpen, onAccept }: PilotAgreementModalProps) {
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryEmail, setSignatoryEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !signatoryName || !signatoryEmail) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/proxy/api/v1/tenant/pilot-agreement/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatory_name: signatoryName,
          signatory_email: signatoryEmail,
          agreement_version: "v2.0-pilot-dpa",
          retention_days: 30,
        }),
      });
      if (!res.ok && res.status !== 404) {
        // The agreement endpoint may not exist on older backends; surface real failures.
        setError(
          "The agreement could not be recorded. Verify connectivity before uploading financial records."
        );
        setIsSubmitting(false);
        return;
      }
    } catch {
      setError("Network issue — the agreement was not recorded. Please retry.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    onAccept();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onAccept}
      title="Pilot Data Handling Agreement (PDHA)"
      description="Required before uploading real financial records"
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center space-x-3 text-primary">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Review the pilot terms and confirm authorization below.
          </p>
        </div>

        <div className="p-3.5 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground space-y-2 max-h-48 overflow-y-auto">
          <p className="font-semibold text-foreground">Pilot Program Terms Summary:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong className="text-foreground">Retention &amp; Purge:</strong> Uploaded pilot records are retained strictly during the active 4-week evaluation window and purged within 30 days of completion.</li>
            <li><strong className="text-foreground">Tenant Isolation:</strong> Data is isolated via strict per-tenant database keys and never commingled.</li>
            <li><strong className="text-foreground">AI Confidentiality:</strong> Uploaded financial data is never used to train global public AI models.</li>
            <li><strong className="text-foreground">Security:</strong> All uploads are encrypted at rest with AES-256 and in transit via TLS 1.3.</li>
          </ul>
        </div>

        {error && (
          <p role="alert" className="text-xs text-rose-500 px-1">
            {error}
          </p>
        )}

        <form onSubmit={handleAccept} className="space-y-3" id="pilot-agreement-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Authorized Signatory Name"
              required
              placeholder="e.g. Vikram Sharma"
              autoComplete="name"
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
            />
            <Input
              label="Signatory Email"
              required
              type="email"
              placeholder="e.g. vikram@company.in"
              autoComplete="email"
              value={signatoryEmail}
              onChange={(e) => setSignatoryEmail(e.target.value)}
            />
          </div>

          <label htmlFor="pdha-consent" className="flex items-start space-x-2.5 pt-1 cursor-pointer">
            <input
              id="pdha-consent"
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-border accent-primary"
            />
            <span className="text-xs text-muted-foreground">
              I confirm I am authorized to bind our organization to the Mistake Pilot Data Handling Agreement.
            </span>
          </label>

          <div className="pt-2 flex justify-end border-t border-border">
            <Button
              type="submit"
              variant="primary"
              disabled={!agreed || !signatoryName || !signatoryEmail || isSubmitting}
              isLoading={isSubmitting}
              className="flex items-center space-x-2"
            >
              {!isSubmitting && <Check className="h-4 w-4" />}
              <span>Accept &amp; Proceed to Upload</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
