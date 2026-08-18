import { ApiClient } from "./client";
import { httpJsonRequest } from "./http-requester";
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

export class HttpApiClient implements ApiClient {
  private baseUrl = "/api/proxy";

  private req<T>(path: string, options: RequestInit = {}, serverToken?: string): Promise<T> {
    return httpJsonRequest<T>(this.baseUrl, path, options, serverToken);
  }

  // Auth & Session
  async signup(payload: SignupPayload): Promise<SignupResponse> {
    return this.req<SignupResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) });
  }
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return this.req<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
  }
  async refreshToken(): Promise<LoginResponse> {
    return this.req<LoginResponse>("/api/auth/refresh", { method: "POST" });
  }
  async verifyMfa(payload: MfaVerifyPayload): Promise<LoginResponse> {
    return this.req<LoginResponse>("/api/auth/mfa", { method: "POST", body: JSON.stringify(payload) });
  }
  async logout(): Promise<void> {
    await this.req<void>("/api/auth/logout", { method: "POST" });
  }
  async getCurrentUser(): Promise<User> {
    return this.req<User>("/api/auth/me");
  }

  // Tenant & Organization
  async getTenant(): Promise<Tenant> {
    return this.req<Tenant>("/tenant");
  }
  async updateTenant(data: Partial<Tenant>): Promise<Tenant> {
    return this.req<Tenant>("/tenant", { method: "PATCH", body: JSON.stringify(data) });
  }
  async getUsers(): Promise<TeamMember[]> {
    return this.req<TeamMember[]>("/users");
  }
  async inviteUser(payload: InvitePayload): Promise<TeamMember> {
    return this.req<TeamMember>("/users/invite", { method: "POST", body: JSON.stringify(payload) });
  }

  // Data Sources / Ingestion
  async getDataSources(): Promise<DataSource[]> {
    return this.req<DataSource[]>("/data-sources");
  }
  async getDataSource(id: string): Promise<DataSource> {
    return this.req<DataSource>(`/data-sources/${id}`);
  }
  async uploadDataSource(file: File | { name: string; size: number; format: string }): Promise<DataSource> {
    const formData = new FormData();
    if (file instanceof File) formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/data-sources`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("File upload failed");
    return res.json();
  }
  async retryDataSource(id: string): Promise<DataSource> {
    return this.req<DataSource>(`/data-sources/${id}/retry`, { method: "POST" });
  }

  // Canonical Entities
  async getEntities(params?: { type?: string; q?: string }): Promise<Entity[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.req<Entity[]>(`/entities?${query}`);
  }
  async getEntity(id: string): Promise<Entity> {
    return this.req<Entity>(`/entities/${id}`);
  }
  async getEntityTimeline(entityId: string): Promise<BusinessEvent[]> {
    return this.req<BusinessEvent[]>(`/entities/${entityId}/timeline`);
  }
  async getReviewQueue(): Promise<ReviewQueueItem[]> {
    return this.req<ReviewQueueItem[]>("/entities/review-queue");
  }
  async mergeEntity(payload: MergePayload): Promise<{ success: boolean; surviving_entity_id: string }> {
    return this.req<{ success: boolean; surviving_entity_id: string }>(
      `/entities/${payload.surviving_entity_id}/merge`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  }
  async rejectMerge(id: string): Promise<{ success: boolean }> {
    return this.req<{ success: boolean }>(`/entities/${id}/reject-merge`, { method: "POST" });
  }

  // Financial Leakage Investigation Workspace
  async getMistakes(params?: { status?: string; type?: string; severity?: string }): Promise<Mistake[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.req<Mistake[]>(`/mistakes?${query}`);
  }
  async getMistake(id: string): Promise<Mistake> {
    return this.req<Mistake>(`/mistakes/${id}`);
  }
  async updateMistakeStatus(id: string, status: MistakeStatus, reason?: string): Promise<Mistake> {
    return this.req<Mistake>(`/mistakes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) });
  }
  async assignMistake(id: string, userId: string): Promise<Mistake> {
    return this.req<Mistake>(`/mistakes/${id}/assign`, { method: "PATCH", body: JSON.stringify({ user_id: userId }) });
  }

  // Intelligence Dashboard & Global Search
  async getDashboardSummary(serverToken?: string): Promise<DashboardSummary> {
    return this.req<DashboardSummary>("/dashboard/summary", {}, serverToken);
  }
  async search(query: string, type?: string): Promise<SearchResponse> {
    return this.req<SearchResponse>(`/search?q=${encodeURIComponent(query)}&type=${type || ""}`);
  }

  // Audit Logs & Retention & Billing
  async getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
    const query = new URLSearchParams(filter as Record<string, string>).toString();
    return this.req<AuditLog[]>(`/audit-logs?${query}`);
  }
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    return this.req<RetentionPolicy[]>("/retention-policy");
  }
  async updateRetentionPolicy(id: string, days: number): Promise<RetentionPolicy> {
    return this.req<RetentionPolicy>(`/retention-policy/${id}`, { method: "PATCH", body: JSON.stringify({ retention_days: days }) });
  }
  async getSubscription(): Promise<Subscription> {
    return this.req<Subscription>("/billing/subscription");
  }
  async getInvoices(): Promise<Invoice[]> {
    return this.req<Invoice[]>("/billing/invoices");
  }
}
