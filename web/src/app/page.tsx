import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LiveMetricsStats } from "@/components/landing/LiveMetricsStats";
import { DetectionEngineShowcase } from "@/components/landing/DetectionEngineShowcase";
import { PaiseProofSection } from "@/components/landing/PaiseProofSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <LiveMetricsStats />
        <DetectionEngineShowcase />
        <PaiseProofSection />
        <FeatureGrid />
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
