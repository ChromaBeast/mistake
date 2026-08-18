import { UserRole } from "./auth";

export interface Tenant {
  id: string;
  name: string;
  legal_name?: string;
  gstin?: string;
  industry?: string;
  default_currency: string;
  plan_tier: "starter" | "growth" | "enterprise";
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "invited" | "disabled";
  joined_at: string;
}

export interface InvitePayload {
  email: string;
  role: UserRole;
  name?: string;
}

export interface RetentionPolicy {
  id: string;
  tenant_id: string;
  resource_type: string;
  retention_days: number;
  auto_purge_enabled: boolean;
  last_purged_at?: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_tier: "starter" | "growth" | "enterprise";
  status: "active" | "past_due" | "canceled";
  current_period_end: string;
  price_paise_monthly: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount_minor: number;
  currency: string;
  status: "paid" | "open" | "void";
  issued_at: string;
  paid_at?: string;
  pdf_url?: string;
}
