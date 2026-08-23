"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { SearchResult } from "@/types";
import { formatPaiseToINR } from "@/lib/formatters/inr";

export function GlobalSearchModal({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const requestSeqRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle with Ctrl/Cmd+K; close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && /^k$/i.test(e.key)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpen?.();
        return;
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  // Move focus into the dialog and lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced search with stale-response guard
  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    const seq = ++requestSeqRef.current;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(query);
        if (seq !== requestSeqRef.current) return;
        setResults(res?.results || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.error(err);
        if (seq !== requestSeqRef.current) return;
        setResults([]);
      } finally {
        if (seq === requestSeqRef.current) setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative w-full max-w-2xl rounded-xl bg-card border border-border p-4 shadow-2xl z-10 space-y-4 animate-fade-up"
      >
        <div className="flex items-center space-x-3 border-b border-border pb-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all suppliers, customers, orders, invoices, and leaks..."
            aria-label="Search query"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1" role="listbox" aria-label="Search results">
          {isSearching && (
            <p className="text-xs text-muted-foreground p-4 text-center animate-pulse">Searching…</p>
          )}
          {!isSearching && results.length === 0 && query.trim() && (
            <p className="text-xs text-muted-foreground p-4 text-center">
              No matching records found for &ldquo;{query}&rdquo;.
            </p>
          )}
          {results.map((res) => (
            <button
              key={res.id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(res.url)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/70 cursor-pointer transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{res.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{res.subtitle}</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0 pl-2">
                {!!res.financial_impact_minor && (
                  <span className="text-xs font-mono font-bold text-rose-500">
                    {formatPaiseToINR(res.financial_impact_minor)}
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
