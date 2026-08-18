export type PipelineState =
  | "Queued"
  | "Processing"
  | "Extracting"
  | "Analyzing"
  | "Completed"
  | "Failed";

export type SourceFormat = "csv" | "xlsx" | "pdf" | "eml" | "erp";

export interface DataSource {
  id: string;
  tenant_id: string;
  name: string;
  file_name: string;
  file_size_bytes: number;
  format: SourceFormat;
  status: PipelineState;
  progress_percent: number;
  total_records_extracted: number;
  mistakes_found_count: number;
  error_message?: string;
  error_code?: string;
  uploaded_by_user_id: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  completed_at?: string;
}

export interface IngestionError {
  code: string;
  title: string;
  description: string;
  recommended_action: string;
  file_name: string;
  line_number?: number;
}

export interface IngestionStats {
  total_files_uploaded: number;
  total_records_processed: number;
  active_pipelines: number;
  success_rate_percent: number;
}
