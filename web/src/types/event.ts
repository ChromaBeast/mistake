export type EventSourceType = "csv" | "xlsx" | "pdf" | "eml" | "erp" | "manual";

export interface BusinessEvent {
  id: string;
  tenant_id: string;
  entity_id: string;
  entity_name: string;
  event_type: string;
  title: string;
  description: string;
  source_type: EventSourceType;
  source_document_name: string;
  occurred_at: string;
  occurred_at_precision: "date_only" | "timestamp";
  observed_at: string;
  amount_minor?: number;
  metadata?: Record<string, unknown>;
}
