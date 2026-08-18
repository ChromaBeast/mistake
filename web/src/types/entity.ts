export type EntityType = "Customer" | "Supplier" | "Product";

export interface EntityAlias {
  id: string;
  alias_name: string;
  source_document_id?: string;
  source_name?: string;
  confidence_score: number;
  created_at: string;
}

export interface Entity {
  id: string;
  tenant_id: string;
  type: EntityType;
  canonical_name: string;
  gstin?: string;
  pan?: string;
  aliases: EntityAlias[];
  total_orders_count: number;
  total_volume_minor: number;
  active_mistakes_count: number;
  risk_score: number;
  created_at: string;
  updated_at?: string;
}

export interface ReviewQueueItem {
  id: string;
  tenant_id: string;
  entity_type: EntityType;
  incoming_name: string;
  candidate_entity_id: string;
  candidate_entity_name: string;
  similarity_score: number;
  source_document_name: string;
  source_format: string;
  suggested_at: string;
}

export interface MergePayload {
  surviving_entity_id: string;
  merged_entity_id: string;
}
