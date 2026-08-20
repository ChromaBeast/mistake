export type MistakeType =
  | "quantity_mismatch"
  | "price_mismatch"
  | "date_mismatch"
  | "status_mismatch"
  | "missing_evidence"
  | "lead_time_anomaly";

export type MistakeSeverity = "critical" | "high" | "medium" | "low";

export type MistakeStatus =
  | "detected"
  | "under_review"
  | "verified"
  | "resolved"
  | "dismissed";

export interface BoundingBox {
  page_number: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface EvidenceRef {
  id: string;
  document_id: string;
  document_name: string;
  document_type: string;
  field_name: string;
  extracted_value: string;
  confidence: number;
  bounding_box?: BoundingBox;
  raw_snippet?: string;
  observed_at: string;
}

export interface MathProof {
  formula: string;
  unit_price_minor: number;
  expected_quantity: number;
  actual_quantity: number;
  quantity_delta: number;
  expected_amount_minor: number;
  actual_amount_minor: number;
  financial_impact_minor: number;
}

export interface MistakeTransition {
  id: string;
  mistake_id: string;
  from_status: MistakeStatus;
  to_status: MistakeStatus;
  user_id: string;
  user_name: string;
  reason?: string;
  created_at: string;
}

export interface Mistake {
  id: string;
  tenant_id: string;
  title: string;
  type: MistakeType;
  severity: MistakeSeverity;
  status: MistakeStatus;
  financial_impact_minor: number;
  entity_id: string;
  entity_name: string;
  assigned_to_user_id?: string;
  assigned_to_name?: string;
  explanation: string;
  remediation_advice: string[];
  confidence_score: number;
  compound_group_id?: string;
  is_compound?: boolean;
  math_proof?: MathProof;
  evidence_items: EvidenceRef[];
  transitions?: MistakeTransition[];
  detected_at: string;
  updated_at?: string;
}
