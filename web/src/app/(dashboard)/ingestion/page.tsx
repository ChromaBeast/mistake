"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { DataSource, IngestionError } from "@/types";
import { UploadDropzone } from "@/components/ingestion/UploadDropzone";
import { PipelineProgressStepper } from "@/components/ingestion/PipelineProgressStepper";
import { DataSourceList } from "@/components/ingestion/DataSourceList";
import { ErrorDiagnosticsCard } from "@/components/ingestion/ErrorDiagnosticsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { IngestionSkeleton } from "@/components/ui/skeletons/IngestionSkeleton";
import { FileUp, Layers, CheckCircle2, AlertTriangle } from "lucide-react";

const TERMINAL_STATUSES = ["Completed", "Failed"];

export default function IngestionPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeJob, setActiveJob] = useState<DataSource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const updated = await api.getDataSource(id);
        if (!mountedRef.current) return;
        setDataSources((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        setActiveJob((current) => (current?.id === updated.id ? updated : current));
        if (TERMINAL_STATUSES.includes(updated.status)) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 2000);
  };

  const loadSources = async () => {
    setLoadError(null);
    try {
      const res = await api.getDataSources();
      if (!mountedRef.current) return;
      const list = Array.isArray(res) ? res : [];
      setDataSources(list);
      const inProgress = list.find(
        (d) => d.status === "Processing" || d.status === "Extracting" || d.status === "Analyzing"
      );
      if (inProgress) {
        setActiveJob(inProgress);
        startPolling(inProgress.id);
      } else if (list.length > 0 && !activeJob) {
        setActiveJob(list[0]);
      }
    } catch (err) {
      console.error(err);
      if (mountedRef.current) {
        setDataSources([]);
        setLoadError("Could not reach the ingestion service. Verify the backend is running and retry.");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const newDs = await api.uploadDataSource(file);
      if (!mountedRef.current) return;
      setDataSources((prev) => [newDs, ...prev.filter((d) => d.id !== newDs.id)]);
      setActiveJob(newDs);
      if (!TERMINAL_STATUSES.includes(newDs.status)) {
        startPolling(newDs.id);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      if (mountedRef.current) {
        setUploadError(
          err instanceof Error ? err.message : "The document could not be uploaded. Check the file format and retry."
        );
      }
    } finally {
      if (mountedRef.current) setIsUploading(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const retried = await api.retryDataSource(id);
      setDataSources((prev) => prev.map((d) => (d.id === id ? retried : d)));
      setActiveJob(retried);
      if (!TERMINAL_STATUSES.includes(retried.status)) {
        startPolling(retried.id);
      }
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  if (isLoading) {
    return <IngestionSkeleton />;
  }

  const failedSources = dataSources.filter((d) => d.status === "Failed");
  const diagnostics: IngestionError[] = failedSources.map((ds) => ({
    file_name: ds.file_name,
    code: ds.error_code || "INGEST_PARSE_ERROR",
    title: "Document Parsing / Extraction Variance",
    description: ds.error_message || "Encountered formatting or syntax error during OCR / tabular normalization.",
    recommended_action: "Verify file encoding, ensure headers match standard PO/Invoice formats, and re-upload.",
  }));

  return (
    <ErrorBoundary fallbackTitle="Could not load Ingestion Hub">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <FileUp className="h-5 w-5 text-primary" />
            <span>Multi-Format Ingestion Hub</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingest SAP/Tally Excel, GST returns, PDF invoices, and E-Way bills with async 5-state extraction.
          </p>
        </div>

        {loadError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
            <div className="text-xs text-destructive flex-1">{loadError}</div>
            <button
              onClick={loadSources}
              className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {uploadError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
            <div className="text-xs text-destructive">{uploadError}</div>
          </div>
        )}

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
                        Pipeline Status: {activeJob.status} ({activeJob.progress_percent ?? 0}%)
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

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pipeline Diagnostics</h3>
            {diagnostics.length === 0 ? (
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Pipeline Engine Healthy
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground font-mono">0 ACTIVE INGESTION ERRORS</p>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  All ingested datasets, PDF invoices, and spreadsheets have passed OCR syntax validation and schema reconciliation.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {diagnostics.map((err) => (
                  <ErrorDiagnosticsCard key={`${err.file_name}-${err.code}`} error={err} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
