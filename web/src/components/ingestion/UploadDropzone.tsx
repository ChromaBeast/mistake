"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function UploadDropzone({ onUpload, isLoading }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [".csv", ".xlsx", ".xls", ".pdf", ".eml"];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setErrorMessage("Unsupported format. Please upload CSV, XLSX, PDF, or EML files.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File exceeds maximum allowed size of 25MB.");
      return;
    }

    setErrorMessage(null);
    await onUpload(file);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-slate-400 bg-card"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf,.eml"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Drag and drop business documents to ingest
        </h4>
        <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
          Supports SAP/Tally Excel sheets, GST Returns, PDF Invoices, E-Way bills, and Email orders up to 25MB.
        </p>

        <div className="flex items-center space-x-3 mt-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center space-x-1">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span>.CSV / .XLSX</span>
          </span>
          <span className="flex items-center space-x-1">
            <FileText className="h-3.5 w-3.5 text-rose-500" />
            <span>.PDF</span>
          </span>
        </div>

        <Button size="sm" variant="outline" className="mt-4" isLoading={isLoading}>
          Select File from Device
        </Button>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
