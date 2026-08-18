"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col pl-0 lg:pl-60 min-w-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsMobileNavOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}

