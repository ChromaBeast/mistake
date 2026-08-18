import { Tenant, TeamMember, RetentionPolicy, Subscription, Invoice, User } from "@/types";

export const initialTenant: Tenant = {
  id: "ten-001",
  name: "Bharat Heavy Engineering Ltd",
  legal_name: "Bharat Heavy Engineering & Fabrication Pvt Ltd",
  gstin: "27AABCB8901N1ZP",
  industry: "Manufacturing & Heavy Industrial",
  default_currency: "INR",
  plan_tier: "growth",
  created_at: "2026-06-01T00:00:00Z",
};

export const initialCurrentUser: User = {
  id: "usr-001",
  tenant_id: "ten-001",
  email: "aditya@bharatheavyeng.in",
  name: "Aditya Verma",
  role: "Owner",
  is_mfa_enabled: true,
  created_at: "2026-06-01T00:00:00Z",
};

export const initialTeamMembers: TeamMember[] = [
  {
    id: "tm-01",
    user_id: "usr-001",
    tenant_id: "ten-001",
    name: "Aditya Verma",
    email: "aditya@bharatheavyeng.in",
    role: "Owner",
    status: "active",
    joined_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "tm-02",
    user_id: "usr-002",
    tenant_id: "ten-001",
    name: "Rohan Sharma",
    email: "rohan.s@bharatheavyeng.in",
    role: "Analyst",
    status: "active",
    joined_at: "2026-06-15T00:00:00Z",
  },
  {
    id: "tm-03",
    user_id: "usr-003",
    tenant_id: "ten-001",
    name: "Pooja Kulkarni",
    email: "pooja.k@bharatheavyeng.in",
    role: "Manager",
    status: "active",
    joined_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "tm-04",
    user_id: "usr-004",
    tenant_id: "ten-001",
    name: "Suresh Iyer",
    email: "suresh.iyer@bharatheavyeng.in",
    role: "Viewer",
    status: "invited",
    joined_at: "2026-08-10T00:00:00Z",
  },
];

export const initialRetentionPolicies: RetentionPolicy[] = [
  {
    id: "ret-01",
    tenant_id: "ten-001",
    resource_type: "raw_documents",
    retention_days: 90,
    auto_purge_enabled: true,
    last_purged_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "ret-02",
    tenant_id: "ten-001",
    resource_type: "extracted_evidence",
    retention_days: 365,
    auto_purge_enabled: true,
    last_purged_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "ret-03",
    tenant_id: "ten-001",
    resource_type: "audit_logs",
    retention_days: 2555, // 7 years
    auto_purge_enabled: false,
    updated_at: "2026-08-01T00:00:00Z",
  },
];

export const initialSubscription: Subscription = {
  id: "sub-001",
  tenant_id: "ten-001",
  plan_tier: "growth",
  status: "active",
  current_period_end: "2026-09-01T00:00:00Z",
  price_paise_monthly: 1499900, // ₹ 14,999.00
};

export const initialInvoices: Invoice[] = [
  {
    id: "inv-2026-08",
    invoice_number: "MST-INV-2026-08",
    amount_minor: 1499900,
    currency: "INR",
    status: "paid",
    issued_at: "2026-08-01T00:00:00Z",
    paid_at: "2026-08-01T00:05:00Z",
    pdf_url: "#",
  },
  {
    id: "inv-2026-07",
    invoice_number: "MST-INV-2026-07",
    amount_minor: 1499900,
    currency: "INR",
    status: "paid",
    issued_at: "2026-07-01T00:00:00Z",
    paid_at: "2026-07-01T00:04:00Z",
    pdf_url: "#",
  },
];
