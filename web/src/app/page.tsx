import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ExecutiveSpendCalculator } from "@/components/landing/ExecutiveSpendCalculator";
import { DetectionEngineShowcase } from "@/components/landing/DetectionEngineShowcase";
import { LiveMetricsStats } from "@/components/landing/LiveMetricsStats";
import { IndustrySolutionsSection } from "@/components/landing/IndustrySolutionsSection";
import { EnterpriseArchitectureSection } from "@/components/landing/EnterpriseArchitectureSection";
import { PaiseProofSection } from "@/components/landing/PaiseProofSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { CallToAction } from "@/components/landing/CallToAction";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background antialiased">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <ExecutiveSpendCalculator />
        <LiveMetricsStats />
        <DetectionEngineShowcase />
        <IndustrySolutionsSection />
        <EnterpriseArchitectureSection />
        <PaiseProofSection />
        <FeatureGrid />
        <CallToAction />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
