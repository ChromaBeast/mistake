import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { DetectionEngineShowcase } from "@/components/landing/DetectionEngineShowcase";
import { EnterpriseArchitectureSection } from "@/components/landing/EnterpriseArchitectureSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background antialiased">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <DetectionEngineShowcase />
        <EnterpriseArchitectureSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
