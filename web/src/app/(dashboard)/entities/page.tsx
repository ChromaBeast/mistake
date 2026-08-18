"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Entity } from "@/types";
import { EntityDirectoryGrid } from "@/components/entities/EntityDirectoryGrid";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Users, GitMerge, Search } from "lucide-react";

export default function EntityExplorerPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await api.getEntities({
          type: activeTab === "All" ? undefined : activeTab,
          q: searchQuery || undefined,
        });
        setEntities(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeTab, searchQuery]);

  const tabs = [
    { id: "All", label: "All Counterparties" },
    { id: "Supplier", label: "Suppliers" },
    { id: "Customer", label: "Customers" },
  ];

  return (
    <div className="space-y-6">
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

        <Link href="/entities/review">
          <Button size="sm" variant="outline" className="flex items-center space-x-1.5">
            <GitMerge className="h-4 w-4 text-primary" />
            <span>Human Review Queue</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company or GSTIN..."
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <EntityDirectoryGrid entities={entities} />
      )}
    </div>
  );
}
