"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { SearchResult } from "@/types";
import { formatPaiseToINR } from "@/lib/formatters/inr";

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.search(query);
        setResults(res.results);
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-card border border-border p-4 shadow-2xl z-10 space-y-4">
        <div className="flex items-center space-x-3 border-b border-border pb-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all suppliers, customers, orders, invoices, and leaks..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1">
          {results.length === 0 && query.trim() && (
            <p className="text-xs text-muted-foreground p-4 text-center">
              No matching records found for &ldquo;{query}&rdquo;.
            </p>
          )}
          {results.map((res) => (
            <div
              key={res.id}
              onClick={() => handleSelect(res.url)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/70 cursor-pointer transition-colors"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">{res.title}</p>
                <p className="text-[11px] text-muted-foreground">{res.subtitle}</p>
              </div>
              <div className="flex items-center space-x-2">
                {res.financial_impact_minor && (
                  <span className="text-xs font-mono font-bold text-rose-500">
                    {formatPaiseToINR(res.financial_impact_minor)}
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
