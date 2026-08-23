"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Entity, BusinessEvent } from "@/types";
import { EntityDetailHeader } from "@/components/entities/EntityDetailHeader";
import { AliasTagList } from "@/components/entities/AliasTagList";
import { MultiSourceTimeline } from "@/components/workspace/MultiSourceTimeline";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function EntityDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [entity, setEntity] = useState<Entity | null>(null);
  const [timeline, setTimeline] = useState<BusinessEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setError(null);
      setIsLoading(true);
      try {
        const ent = await api.getEntity(id as string);
        if (cancelled) return;
        setEntity(ent);
        try {
          const events = await api.getEntityTimeline(id as string);
          if (!cancelled) setTimeline(events);
        } catch {
          if (!cancelled) setTimeline([]); // timeline is supplementary
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setEntity(null);
          setError(err instanceof Error ? err.message : "This entity could not be loaded.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="space-y-6">
        <Button size="sm" variant="ghost" onClick={() => router.push("/entities")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Entities
        </Button>
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error || "This entity could not be loaded."}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-xs underline underline-offset-2 hover:opacity-75 transition-opacity shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button size="sm" variant="ghost" onClick={() => router.push("/entities")}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Entities
      </Button>

      <EntityDetailHeader entity={entity} />

      <AliasTagList aliases={entity.aliases ?? []} />

      <MultiSourceTimeline events={timeline} />
    </div>
  );
}
