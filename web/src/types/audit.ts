export interface AuditDiff {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name?: string;
  ip_address?: string;
  user_agent?: string;
  diff?: AuditDiff[];
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditFilter {
  action?: string;
  resource_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}
