import { ApiClient } from "./client";
import { httpJsonRequest, HttpApiError, buildQuery } from "./http-requester";
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
  Notification,
} from "@/types";

import { normalizeDashboardSummary } from "./adapters/dashboard-adapter";

let refreshPromise: Promise<boolean> | null = null;

function singleFlightRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export class HttpApiClient implements ApiClient {
  private baseUrl = "/api/proxy";

  private req<T>(path: string, options: RequestInit = {}, serverToken?: string): Promise<T> {
    return httpJsonRequest<T>(this.baseUrl, path, options, serverToken);
  }

  // On a 401 from an expired short-lived access cookie, refresh the session
  // once (single-flight) and retry the original request.
  private async reqWithRefresh<T>(
    path: string,
    options: RequestInit = {},
    serverToken?: string
  ): Promise<T> {
    try {
      return await this.req<T>(path, options, serverToken);
    } catch (err) {
      if (err instanceof HttpApiError && err.status === 401) {
        const refreshed = await singleFlightRefresh();
        if (refreshed) {
          return this.reqWithRefresh<T>(path, options, serverToken);
        }
      }
      throw err;
    }
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
    return this.reqWithRefresh<User>("/api/auth/me");
  }

  // Tenant & Organization
  async getTenant(): Promise<Tenant> {
    return this.reqWithRefresh<Tenant>("/tenant");
  }
  async updateTenant(data: Partial<Tenant>): Promise<Tenant> {
    return this.reqWithRefresh<Tenant>("/tenant", { method: "PATCH", body: JSON.stringify(data) });
  }
  async getUsers(): Promise<TeamMember[]> {
    const res = await this.reqWithRefresh<TeamMember[]>("/users");
    return Array.isArray(res) ? res : [];
  }
  async inviteUser(payload: InvitePayload): Promise<TeamMember> {
    return this.reqWithRefresh<TeamMember>("/users/invite", { method: "POST", body: JSON.stringify(payload) });
  }

  // Data Sources / Ingestion
  async getDataSources(): Promise<DataSource[]> {
    const res = await this.reqWithRefresh<DataSource[]>("/data-sources");
    return Array.isArray(res) ? res : [];
  }
  async getDataSource(id: string): Promise<DataSource> {
    return this.reqWithRefresh<DataSource>(`/data-sources/${id}`);
  }
  async uploadDataSource(file: File | { name: string; size: number; format: string }): Promise<DataSource> {
    const formData = new FormData();
    if (file instanceof File) formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/data-sources`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("File upload failed");
    return res.json();
  }
  async retryDataSource(id: string): Promise<DataSource> {
    return this.reqWithRefresh<DataSource>(`/data-sources/${id}/retry`, { method: "POST" });
  }

  // Canonical Entities
  async getEntities(params?: { type?: string; q?: string }): Promise<Entity[]> {
    const query = buildQuery(params);
    const res = await this.reqWithRefresh<Entity[]>(`/entities?${query}`);
    return Array.isArray(res) ? res : [];
  }
  async getEntity(id: string): Promise<Entity> {
    return this.reqWithRefresh<Entity>(`/entities/${id}`);
  }
  async getEntityTimeline(entityId: string): Promise<BusinessEvent[]> {
    const res = await this.reqWithRefresh<BusinessEvent[]>(`/entities/${entityId}/timeline`);
    return Array.isArray(res) ? res : [];
  }
  async getReviewQueue(): Promise<ReviewQueueItem[]> {
    const res = await this.reqWithRefresh<ReviewQueueItem[]>("/entities/review-queue");
    return Array.isArray(res) ? res : [];
  }
  async mergeEntity(payload: MergePayload): Promise<{ success: boolean; surviving_entity_id: string }> {
    return this.reqWithRefresh<{ success: boolean; surviving_entity_id: string }>(
      `/entities/${payload.surviving_entity_id}/merge`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  }
  async rejectMerge(id: string): Promise<{ success: boolean }> {
    return this.reqWithRefresh<{ success: boolean }>(`/entities/${id}/reject-merge`, { method: "POST" });
  }

  // Financial Leakage Investigation Workspace
  async getMistakes(params?: { status?: string; type?: string; severity?: string }): Promise<Mistake[]> {
    const query = buildQuery(params);
    const res = await this.reqWithRefresh<Mistake[]>(`/mistakes?${query}`);
    return Array.isArray(res) ? res : [];
  }
  async getMistake(id: string): Promise<Mistake> {
    return this.reqWithRefresh<Mistake>(`/mistakes/${id}`);
  }
  async updateMistakeStatus(id: string, status: MistakeStatus, reason?: string): Promise<Mistake> {
    return this.reqWithRefresh<Mistake>(`/mistakes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) });
  }
  async assignMistake(id: string, userId: string): Promise<Mistake> {
    return this.reqWithRefresh<Mistake>(`/mistakes/${id}/assign`, { method: "PATCH", body: JSON.stringify({ user_id: userId }) });
  }

  // Intelligence Dashboard & Global Search
  async getDashboardSummary(serverToken?: string): Promise<DashboardSummary> {
    const raw = await this.reqWithRefresh<any>("/dashboard/summary", {}, serverToken);
    return normalizeDashboardSummary(raw);
  }
  async search(query: string, type?: string): Promise<SearchResponse> {
    const raw = await this.reqWithRefresh<any>(buildQuery({ q: query, type }));
    if (raw && typeof raw === "object" && Array.isArray(raw.results)) {
      return {
        query: raw.query || query,
        total_results: raw.total_results ?? raw.results.length,
        results: raw.results,
        facets: raw.facets || {},
      };
    }
    const resultsList = Array.isArray(raw) ? raw : [];
    return {
      query,
      total_results: resultsList.length,
      results: resultsList,
      facets: {},
    };
  }

  // Audit Logs & Retention & Billing
  async getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
    const query = buildQuery(filter ? { ...filter } : undefined);
    const res = await this.reqWithRefresh<AuditLog[]>(`/audit-logs${query}`);
    return Array.isArray(res) ? res : [];
  }
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    const res = await this.reqWithRefresh<RetentionPolicy[]>("/retention-policy");
    return Array.isArray(res) ? res : [];
  }
  async updateRetentionPolicy(id: string, days: number): Promise<RetentionPolicy> {
    return this.reqWithRefresh<RetentionPolicy>(`/retention-policy/${id}`, { method: "PATCH", body: JSON.stringify({ retention_days: days }) });
  }
  async getSubscription(): Promise<Subscription> {
    return this.reqWithRefresh<Subscription>("/billing/subscription");
  }
  async getInvoices(): Promise<Invoice[]> {
    const res = await this.reqWithRefresh<Invoice[]>("/billing/invoices");
    return Array.isArray(res) ? res : [];
  }
  async checkoutSubscription(planTier: string) {
    return this.reqWithRefresh<{ session_id: string; plan_tier: string; amount_minor: number; status: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan_tier: planTier }),
    });
  }
  async getNotifications(): Promise<Notification[]> {
    const res = await this.reqWithRefresh<Notification[]>("/notifications");
    return Array.isArray(res) ? res : [];
  }
  async markNotificationRead(id: string): Promise<void> {
    await this.req<void>(`/notifications/${id}/read`, { method: "PATCH" });
  }
}
