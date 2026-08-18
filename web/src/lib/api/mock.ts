import { ApiClient } from "./client";
import {
  User, LoginPayload, SignupPayload, MfaVerifyPayload,
  Tenant, TeamMember, InvitePayload, RetentionPolicy,
  DataSource, Entity, ReviewQueueItem, MergePayload,
  Mistake, MistakeStatus, BusinessEvent, AuditLog, AuditFilter,
  DashboardSummary, SearchResponse,
  LoginResponse, SignupResponse
} from "@/types";
import { MockDataStore } from "./mock/mock-store";
import { buildDashboardSummary, buildSearchResponse } from "./mock/mock-handlers";
import { initialSubscription, initialInvoices } from "./mock/data-tenant";

export class MockApiClient implements ApiClient {
  private store = new MockDataStore();

  async signup(payload: SignupPayload): Promise<SignupResponse> {
    this.store.tenant.name = payload.company_name;
    this.store.currentUser.email = payload.email;
    this.store.currentUser.name = payload.name;
    return { user: this.store.currentUser, tenant: this.store.tenant };
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    this.store.currentUser.email = payload.email;
    return { user: this.store.currentUser, requires_mfa: false, tenant: this.store.tenant };
  }

  async refreshToken(): Promise<LoginResponse> {
    return { user: this.store.currentUser, requires_mfa: false, tenant: this.store.tenant };
  }

  async verifyMfa(_payload: MfaVerifyPayload): Promise<LoginResponse> {
    return { user: this.store.currentUser, requires_mfa: false, tenant: this.store.tenant };
  }

  async logout() {}
  async getCurrentUser() { return this.store.currentUser; }
  async getTenant() { return this.store.tenant; }

  async updateTenant(data: Partial<Tenant>) {
    this.store.tenant = { ...this.store.tenant, ...data, updated_at: new Date().toISOString() };
    return this.store.tenant;
  }

  async getUsers() { return this.store.teamMembers; }

  async inviteUser(payload: InvitePayload) {
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      user_id: `usr-${Date.now()}`,
      tenant_id: this.store.tenant.id,
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      role: payload.role,
      status: "invited",
      joined_at: new Date().toISOString(),
    };
    this.store.teamMembers.push(newMember);
    return newMember;
  }

  async getDataSources() { return this.store.dataSources; }

  async getDataSource(id: string) {
    const ds = this.store.dataSources.find((d) => d.id === id);
    if (!ds) throw new Error("Data source not found");
    return ds;
  }

  async uploadDataSource(file: File | { name: string; size: number; format: string }) {
    const format = (file.name.split(".").pop()?.toLowerCase() || "csv") as DataSource["format"];
    const newDs: DataSource = {
      id: `ds-${Date.now()}`,
      tenant_id: this.store.tenant.id,
      name: file.name.replace(/\.[^/.]+$/, ""),
      file_name: file.name,
      file_size_bytes: file.size,
      format,
      status: "Processing",
      progress_percent: 25,
      total_records_extracted: 0,
      mistakes_found_count: 0,
      uploaded_by_user_id: this.store.currentUser.id,
      uploaded_by_name: this.store.currentUser.name,
      uploaded_at: new Date().toISOString(),
    };
    this.store.dataSources.unshift(newDs);
    return newDs;
  }

  async retryDataSource(id: string) {
    const ds = await this.getDataSource(id);
    ds.status = "Queued";
    ds.progress_percent = 0;
    return ds;
  }

  async getEntities(params?: { type?: string; q?: string }) {
    let list = [...this.store.entities];
    if (params?.type && params.type !== "All") {
      list = list.filter((e) => e.type.toLowerCase() === params.type?.toLowerCase());
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      list = list.filter((e) => e.canonical_name.toLowerCase().includes(q) || e.gstin?.toLowerCase().includes(q));
    }
    return list;
  }

  async getEntity(id: string) {
    const ent = this.store.entities.find((e) => e.id === id);
    if (!ent) throw new Error("Entity not found");
    return ent;
  }

  async getEntityTimeline(entityId: string) {
    return this.store.events.filter((e) => e.entity_id === entityId);
  }

  async getReviewQueue() { return this.store.reviewQueue; }

  async mergeEntity(payload: MergePayload) {
    this.store.reviewQueue = this.store.reviewQueue.filter((rq) => rq.candidate_entity_id !== payload.merged_entity_id);
    return { success: true, surviving_entity_id: payload.surviving_entity_id };
  }

  async rejectMerge(id: string) {
    this.store.reviewQueue = this.store.reviewQueue.filter((rq) => rq.id !== id);
    return { success: true };
  }

  async getMistakes(params?: { status?: string; type?: string; severity?: string }) {
    let list = [...this.store.mistakes];
    if (params?.status && params.status !== "all") list = list.filter((m) => m.status === params.status);
    if (params?.type && params.type !== "all") list = list.filter((m) => m.type === params.type);
    if (params?.severity && params.severity !== "all") list = list.filter((m) => m.severity === params.severity);
    return list;
  }

  async getMistake(id: string) {
    const m = this.store.mistakes.find((item) => item.id === id);
    if (!m) throw new Error("Mistake not found");
    return m;
  }

  async updateMistakeStatus(id: string, status: MistakeStatus, reason?: string) {
    const m = await this.getMistake(id);
    const oldStatus = m.status;
    m.status = status;
    m.updated_at = new Date().toISOString();
    if (!m.transitions) m.transitions = [];
    m.transitions.unshift({
      id: `tr-${Date.now()}`,
      mistake_id: id,
      from_status: oldStatus,
      to_status: status,
      user_id: this.store.currentUser.id,
      user_name: this.store.currentUser.name,
      reason,
      created_at: new Date().toISOString(),
    });
    return m;
  }

  async assignMistake(id: string, userId: string) {
    const m = await this.getMistake(id);
    const user = this.store.teamMembers.find((u) => u.user_id === userId);
    m.assigned_to_user_id = userId;
    m.assigned_to_name = user?.name ?? "Assigned User";
    return m;
  }

  async getDashboardSummary(): Promise<DashboardSummary> { return buildDashboardSummary(this.store); }
  async search(query: string): Promise<SearchResponse> { return buildSearchResponse(this.store, query); }
  async getAuditLogs(_filter?: AuditFilter) { return this.store.auditLogs; }
  async getRetentionPolicies() { return this.store.retentionPolicies; }

  async updateRetentionPolicy(id: string, days: number) {
    const p = this.store.retentionPolicies.find((pol) => pol.id === id);
    if (!p) throw new Error("Policy not found");
    p.retention_days = days;
    return p;
  }

  async getSubscription() { return initialSubscription; }
  async getInvoices() { return initialInvoices; }
}
