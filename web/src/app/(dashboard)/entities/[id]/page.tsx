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
import { ArrowLeft } from "lucide-react";

export default function EntityDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [entity, setEntity] = useState<Entity | null>(null);
  const [timeline, setTimeline] = useState<BusinessEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const ent = await api.getEntity(id as string);
        setEntity(ent);
        const events = await api.getEntityTimeline(id as string);
        setTimeline(events);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading || !entity) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button size="sm" variant="ghost" onClick={() => router.push("/entities")}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Entities
      </Button>

      <EntityDetailHeader entity={entity} />

      <AliasTagList aliases={entity.aliases} />

      <MultiSourceTimeline events={timeline} />
    </div>
  );
}
