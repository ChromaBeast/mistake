"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Entity } from "@/types";
import { EntityDirectoryGrid } from "@/components/entities/EntityDirectoryGrid";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Users, GitMerge } from "lucide-react";

export default function EntityExplorerPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const requestSeqRef = useRef(0);

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const seq = ++requestSeqRef.current;
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.getEntities({
          type: activeTab === "All" ? undefined : activeTab,
          q: debouncedQuery || undefined,
        });
        if (seq !== requestSeqRef.current) return; // stale response
        setEntities(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error(err);
        if (seq !== requestSeqRef.current) return;
        setEntities([]);
      } finally {
        if (seq === requestSeqRef.current) setIsLoading(false);
      }
    }
    load();
  }, [activeTab, debouncedQuery]);

  const tabs = [
    { id: "All", label: "All Counterparties" },
    { id: "Supplier", label: "Suppliers" },
    { id: "Customer", label: "Customers" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Entity Explorer & Canonical Directory</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Resolve variant vendor and customer names to canonical business entities.
          </p>
        </div>

        <Button href="/entities/review" size="sm" variant="outline" className="flex items-center space-x-1.5 shrink-0">
          <GitMerge className="h-4 w-4 text-primary" />
          <span>Human Review Queue</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="w-full sm:w-72">
          {isLoading && entities.length === 0 ? (
            <Skeleton className="h-9 w-full rounded-md" />
          ) : (
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company or GSTIN..."
              aria-label="Search entities"
            />
          )}
        </div>
      </div>

      {isLoading && entities.length === 0 ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="animate-fade-in">
          <EntityDirectoryGrid entities={entities} />
        </div>
      )}
    </div>
  );
}
