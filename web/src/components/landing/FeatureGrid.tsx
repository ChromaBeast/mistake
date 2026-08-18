import React from "react";
import { Smartphone, History, Users, GitMerge, Lock, Search } from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: Smartphone,
      title: "Factory Floor Mobile Capture",
      desc: "Flutter mobile app for warehouse operators. Edge lux metering, camera document alignment, laser barcode scanning, and offline-first queue.",
    },
    {
      icon: GitMerge,
      title: "Fuzzy Entity Resolution",
      desc: "Handles vendor name typos and multiple alias variations (e.g. 'Bharat Steel' vs 'Bharat Steel & Tubes Ltd') with human review queues.",
    },
    {
      icon: History,
      title: "Immutable Temporal Audit Trail",
      desc: "Every status transition, resolution, waiver, and penalty deduction is immutably logged with timestamp, user ID, and diff snapshots.",
    },
    {
      icon: Lock,
      title: "5-Tier RBAC & Dual-Token Auth",
      desc: "Granular access control (Owner, Admin, Manager, Analyst, Viewer) paired with 15-minute JWTs and rotated 7-day cryptographic refresh tokens.",
    },
    {
      icon: Search,
      title: "Instant Global Search (Cmd + K)",
      desc: "Full-text indexing across all purchase orders, invoices, evidence documents, and discrepancy findings with instant keyboard navigation.",
    },
    {
      icon: Users,
      title: "Collaborative Dispute Resolution",
      desc: "Built-in vendor communication notes, waiver thresholds, and debit note generators to resolve supplier variances without leaving the platform.",
    },
  ];

  return (
    <section id="security" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Built for High-Velocity B2B Operations
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          From factory loading bays to the Chief Financial Officer's desk, Mistake connects every step of the physical-to-financial verification chain.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="space-y-3 p-6 rounded-2xl border border-border/60 bg-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
