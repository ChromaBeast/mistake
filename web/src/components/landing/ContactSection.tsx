"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";

const SPEND_BANDS = [
  "Under ₹50 Cr / yr",
  "₹50 Cr – ₹150 Cr / yr",
  "₹150 Cr – ₹500 Cr / yr",
  "₹500 Cr+ / yr",
];

const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [spendBand, setSpendBand] = useState(SPEND_BANDS[1]);
  const [message, setMessage] = useState("");
  const [honeyPot, setHoneyPot] = useState(""); // spam trap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = name.trim() && emailValid && company.trim() && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || honeyPot) return;
    setError(null);
    setIsSubmitting(true);
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            company: company.trim(),
            spend_band: spendBand,
            message: message.trim(),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // No intake endpoint configured — fall back to the visitor's mail client
        const subject = encodeURIComponent(`Spend Audit Request — ${company.trim()}`);
        const body = encodeURIComponent(
          `Name: ${name.trim()}\nWork Email: ${email.trim()}\nCompany: ${company.trim()}\nAnnual Spend: ${spendBand}\n\n${message.trim()}`
        );
        window.location.href = `mailto:hello@sheershjaiswal.in?subject=${subject}&body=${body}`;
      }
      setSubmitted(true);
    } catch {
      setError("The request could not be sent. Please email hello@sheershjaiswal.in directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
        {/* Pitch column */}
        <div className="space-y-4 max-w-lg">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
            Request your sample audit.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Share a few details and we will run the reconciliation pipeline on a sample batch of
            your historical POs and supplier invoices. You receive an evidence-backed summary of
            recoverable capital within 48 hours — no commitment.
          </p>
          <div className="space-y-2.5 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Paise-exact line-by-line findings, not a summary PDF</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Your documents purged after the evaluation window</span>
            </div>
            <div className="flex items-center gap-2.5 pt-3 border-t border-border/50 mt-4">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>
                Prefer email?{" "}
                <a
                  href="mailto:hello@sheershjaiswal.in"
                  className="text-foreground underline underline-offset-2 hover:opacity-80"
                >
                  hello@sheershjaiswal.in
                </a>{" "}
                — replies within one business day.
              </span>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 md:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-semibold text-foreground">Request received.</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                We will reply to {email.trim()} within one business day with next steps and a secure
                upload link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditya Verma"
                  autoComplete="name"
                  required
                />
                <Input
                  label="Work Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cfo@company.in"
                  autoComplete="email"
                  error={email.length > 0 && !emailValid ? "Enter a valid work email." : undefined}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Bharat Heavy Engineering Ltd"
                  autoComplete="organization"
                  required
                />
                <label className="w-full space-y-1.5 block">
                  <span className="block text-xs font-medium text-foreground">
                    Annual Procurement Spend
                  </span>
                  <select
                    value={spendBand}
                    onChange={(e) => setSpendBand(e.target.value)}
                    aria-label="Annual procurement spend band"
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {SPEND_BANDS.map((band) => (
                      <option key={band} value={band}>
                        {band}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="block text-xs font-medium text-foreground">
                  What should we look at first? <span className="text-muted-foreground">(optional)</span>
                </span>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="E.g., Supplier invoices for the Pune plant FY24; suspected duplicate rate escalations."
                  className="w-full rounded-md border border-input bg-card p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </label>

              {/* Honeypot — hidden from humans, catches naive bots */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeyPot}
                onChange={(e) => setHoneyPot(e.target.value)}
                className="absolute opacity-0 h-0 w-0 pointer-events-none"
              />

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    Request Sample Audit <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-muted-foreground text-center font-mono">
                Sample batch only · Purged post-evaluation · No payment required
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
