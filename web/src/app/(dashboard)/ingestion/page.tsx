"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataSource } from "@/types";
import { UploadDropzone } from "@/components/ingestion/UploadDropzone";
import { PipelineProgressStepper } from "@/components/ingestion/PipelineProgressStepper";
import { DataSourceList } from "@/components/ingestion/DataSourceList";
import { ErrorDiagnosticsCard } from "@/components/ingestion/ErrorDiagnosticsCard";
import { sampleIngestionErrors } from "@/lib/api/mock/data-sources";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { IngestionSkeleton } from "@/components/ui/skeletons/IngestionSkeleton";
import { UploadCloud, Layers } from "lucide-react";

export default function IngestionPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeJob, setActiveJob] = useState<DataSource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSources = async () => {
    try {
      const list = await api.getDataSources();
      setDataSources(list);
      const inProgress = list.find(
        (d) => d.status === "Processing" || d.status === "Extracting" || d.status === "Analyzing"
      );
      if (inProgress) setActiveJob(inProgress);
      else if (list.length > 0) setActiveJob(list[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const newDs = await api.uploadDataSource(file);
      setDataSources((prev) => [newDs, ...prev.filter((d) => d.id !== newDs.id)]);
      setActiveJob(newDs);

      const intervalId = setInterval(async () => {
        try {
          const updated = await api.getDataSource(newDs.id);
          setDataSources((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          setActiveJob((current) => (current?.id === updated.id ? updated : current));
          if (updated.status === "Completed" || updated.status === "Failed") {
            clearInterval(intervalId);
          }
        } catch {
          clearInterval(intervalId);
        }
      }, 2000);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const retried = await api.retryDataSource(id);
      setDataSources((prev) => prev.map((d) => (d.id === id ? retried : d)));
      setActiveJob(retried);
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  if (isLoading) {
    return <IngestionSkeleton />;
  }

  return (
    <ErrorBoundary fallbackTitle="Could not load Ingestion Hub">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            <span>Multi-Format Ingestion Hub</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingest SAP/Tally Excel, GST returns, PDF invoices, and E-Way bills with async 5-state extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UploadDropzone onUpload={handleUpload} isLoading={isUploading} />

            {activeJob && (
              <Card className="border-primary/30">
                <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <div>
                      <CardTitle className="text-xs font-semibold">{activeJob.file_name}</CardTitle>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Pipeline Status: {activeJob.status} ({activeJob.progress_percent}%)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <PipelineProgressStepper status={activeJob.status} />
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Ingested Documents & Batch History</h3>
              <DataSourceList
                dataSources={dataSources}
                onRetry={handleRetry}
                onSelect={(ds) => setActiveJob(ds)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground">Pipeline Diagnostics</h3>
            <div className="space-y-3">
              {sampleIngestionErrors.map((err, i) => (
                <ErrorDiagnosticsCard key={i} error={err} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
