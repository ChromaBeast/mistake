"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ReviewQueueItem } from "@/types";
import { ReviewQueueList } from "@/components/entities/ReviewQueueList";
import { MergeActionModal } from "@/components/entities/MergeActionModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { GitMerge, ArrowLeft } from "lucide-react";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadQueue = async () => {
    try {
      const q = await api.getReviewQueue();
      setItems(q);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleOpenMerge = async (item: ReviewQueueItem) => {
    setSelectedItem(item);
    setIsMergeModalOpen(true);
  };

  const handleConfirmMerge = async () => {
    if (!selectedItem) return;
    await api.mergeEntity({
      surviving_entity_id: selectedItem.candidate_entity_id,
      merged_entity_id: selectedItem.candidate_entity_id,
    });
    setIsMergeModalOpen(false);
    loadQueue();
  };

  const handleReject = async (id: string) => {
    await api.rejectMerge(id);
    loadQueue();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button size="sm" variant="ghost" onClick={() => router.push("/entities")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Directory
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
          <GitMerge className="h-5 w-5 text-primary" />
          <span>Human Review Queue</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review ambiguous supplier and customer name variations (70%–95% similarity score).
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <ReviewQueueList
          items={items}
          onMerge={handleOpenMerge}
          onReject={handleReject}
        />
      )}

      <MergeActionModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        item={selectedItem}
        onConfirm={handleConfirmMerge}
      />
    </div>
  );
}
