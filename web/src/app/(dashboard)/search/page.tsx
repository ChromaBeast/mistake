"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SearchResult } from "@/types";
import { Input } from "@/components/ui/Input";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SearchResultList } from "@/components/search/SearchResultList";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function search() {
      setIsLoading(true);
      try {
        const res = await api.search(query);
        let filtered = res.results;
        if (selectedType !== "all") {
          filtered = filtered.filter((r) => r.type === selectedType || r.subtitle.toLowerCase().includes(selectedType));
        }
        if (selectedSeverity !== "all") {
          filtered = filtered.filter((r) => r.badge?.toLowerCase() === selectedSeverity.toLowerCase());
        }
        setResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    const timer = setTimeout(search, 150);
    return () => clearTimeout(timer);
  }, [query, selectedType, selectedSeverity]);

  const handleReset = () => {
    setSelectedType("all");
    setSelectedSeverity("all");
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
          <Search className="h-5 w-5 text-primary" />
          <span>Cross-Domain Global Search</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Instantly search across counterparties, PO lines, invoices, shipments, and detected leaks.
        </p>
      </div>

      <div className="w-full">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entities, invoices, or finding keywords (e.g. Tata, Freight, Steel, INV-8812)..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterSidebar
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedSeverity={selectedSeverity}
            onSelectSeverity={setSelectedSeverity}
            onReset={handleReset}
          />
        </div>
        <div className="lg:col-span-3">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <SearchResultList results={results} />
          )}
        </div>
      </div>
    </div>
  );
}
