import { ApiClient } from "./client";
import {
  LoginResponse,
  SignupResponse,
  User,
  LoginPayload,
  SignupPayload,
  MfaVerifyPayload,
  Tenant,
  TeamMember,
  InvitePayload,
  RetentionPolicy,
  Subscription,
  Invoice,
  DataSource,
  Entity,
  ReviewQueueItem,
  MergePayload,
  Mistake,
  MistakeStatus,
  BusinessEvent,
  AuditLog,
  AuditFilter,
  DashboardSummary,
  SearchResponse,
} from "@/types";

/**
 * HTTP implementation of ApiClient that communicates with the backend via Next.js proxy & auth routes.
 */
export class HttpApiClient implements ApiClient {
  private baseUrl = "/api/proxy";

  private async request<T>(path: string, options: RequestInit = {}, serverToken?: string): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(serverToken ? { Authorization: `Bearer ${serverToken}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const url = path.startsWith("/api/") ? path : `${this.baseUrl}${path}`;
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  /** Signs up a new user and tenant. */
  async signup(payload: SignupPayload): Promise<SignupResponse> {
    return this.request<SignupResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) });
  }

  /** Logs in a user, setting an HttpOnly auth cookie. */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
  }

  /** Refreshes the auth session using the HttpOnly refresh token cookie. */
  async refreshToken(): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/refresh", { method: "POST" });
  }

  /** Verifies TOTP MFA token. */
  async verifyMfa(payload: MfaVerifyPayload): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/mfa", { method: "POST", body: JSON.stringify(payload) });
  }

  /** Logs out the current user by clearing the HttpOnly cookie. */
  async logout(): Promise<void> {
    await this.request<void>("/api/auth/logout", { method: "POST" });
  }

  /** Gets the current authenticated user profile. */
  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/auth/me");
  }

  /** Gets current tenant details. */
  async getTenant(): Promise<Tenant> {
    return this.request<Tenant>("/tenant");
  }

  /** Updates tenant configuration. */
  async updateTenant(data: Partial<Tenant>): Promise<Tenant> {
    return this.request<Tenant>("/tenant", { method: "PATCH", body: JSON.stringify(data) });
  }

  /** Lists all team members of the tenant. */
  async getUsers(): Promise<TeamMember[]> {
    return this.request<TeamMember[]>("/users");
  }

  /** Invites a new team member. */
  async inviteUser(payload: InvitePayload): Promise<TeamMember> {
    return this.request<TeamMember>("/users/invite", { method: "POST", body: JSON.stringify(payload) });
  }

  /** Lists all data sources. */
  async getDataSources(): Promise<DataSource[]> {
    return this.request<DataSource[]>("/data-sources");
  }

  /** Gets a single data source by ID. */
  async getDataSource(id: string): Promise<DataSource> {
    return this.request<DataSource>(`/data-sources/${id}`);
  }

  /** Uploads a new data source file. */
  async uploadDataSource(file: File | { name: string; size: number; format: string }): Promise<DataSource> {
    const formData = new FormData();
    if (file instanceof File) formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/data-sources`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("File upload failed");
    return res.json();
  }

  /** Retries a failed data source ingestion. */
  async retryDataSource(id: string): Promise<DataSource> {
    return this.request<DataSource>(`/data-sources/${id}/retry`, { method: "POST" });
  }

  /** Lists resolved business entities. */
  async getEntities(params?: { type?: string; q?: string }): Promise<Entity[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<Entity[]>(`/entities?${query}`);
  }

  /** Gets a specific entity by ID. */
  async getEntity(id: string): Promise<Entity> {
    return this.request<Entity>(`/entities/${id}`);
  }

  /** Gets the chronological timeline of events for an entity. */
  async getEntityTimeline(entityId: string): Promise<BusinessEvent[]> {
    return this.request<BusinessEvent[]>(`/entities/${entityId}/timeline`);
  }

  /** Gets entities pending review in the merge queue. */
  async getReviewQueue(): Promise<ReviewQueueItem[]> {
    return this.request<ReviewQueueItem[]>("/entities/review-queue");
  }

  /** Merges candidate entities into a surviving canonical entity. */
  async mergeEntity(payload: MergePayload): Promise<{ success: boolean; surviving_entity_id: string }> {
    return this.request<{ success: boolean; surviving_entity_id: string }>(
      `/entities/${payload.surviving_entity_id}/merge`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  }

  /** Rejects an entity merge suggestion. */
  async rejectMerge(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/entities/${id}/reject-merge`, { method: "POST" });
  }

  /** Lists detected financial leakage mistakes and discrepancies. */
  async getMistakes(params?: { status?: string; type?: string; severity?: string }): Promise<Mistake[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<Mistake[]>(`/mistakes?${query}`);
  }

  /** Gets a specific mistake with full math proof and evidence refs. */
  async getMistake(id: string): Promise<Mistake> {
    return this.request<Mistake>(`/mistakes/${id}`);
  }

  /** Transitions the triage status of a mistake. */
  async updateMistakeStatus(id: string, status: MistakeStatus, reason?: string): Promise<Mistake> {
    return this.request<Mistake>(`/mistakes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) });
  }

  /** Assigns a mistake to an analyst or manager. */
  async assignMistake(id: string, userId: string): Promise<Mistake> {
    return this.request<Mistake>(`/mistakes/${id}/assign`, { method: "PATCH", body: JSON.stringify({ user_id: userId }) });
  }

  /** Gets business health score, KPIs, and trend metrics for the dashboard. */
  async getDashboardSummary(serverToken?: string): Promise<DashboardSummary> {
    return this.request<DashboardSummary>("/dashboard/summary", {}, serverToken);
  }

  /** Global search across entities, orders, and mistakes. */
  async search(query: string, type?: string): Promise<SearchResponse> {
    return this.request<SearchResponse>(`/search?q=${encodeURIComponent(query)}&type=${type || ""}`);
  }

  /** Gets audit trail logs. */
  async getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
    const query = new URLSearchParams(filter as Record<string, string>).toString();
    return this.request<AuditLog[]>(`/audit-logs?${query}`);
  }

  /** Gets current data retention policies. */
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    return this.request<RetentionPolicy[]>("/retention-policy");
  }

  /** Updates retention duration for a data type. */
  async updateRetentionPolicy(id: string, days: number): Promise<RetentionPolicy> {
    return this.request<RetentionPolicy>(`/retention-policy/${id}`, { method: "PATCH", body: JSON.stringify({ retention_days: days }) });
  }

  /** Gets current subscription and billing quota. */
  async getSubscription(): Promise<Subscription> {
    return this.request<Subscription>("/billing/subscription");
  }

  /** Gets past billing invoices and receipts. */
  async getInvoices(): Promise<Invoice[]> {
    return this.request<Invoice[]>("/billing/invoices");
  }
}
