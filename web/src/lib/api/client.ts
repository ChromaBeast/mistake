import {
  User,
  LoginPayload,
  SignupPayload,
  LoginResponse,
  SignupResponse,
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

export interface ApiClient {
  // Auth
  signup(payload: SignupPayload): Promise<SignupResponse>;
  login(payload: LoginPayload): Promise<LoginResponse>;
  refreshToken(): Promise<LoginResponse>;
  verifyMfa(payload: MfaVerifyPayload): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;

  // Tenant & Users
  getTenant(): Promise<Tenant>;
  updateTenant(data: Partial<Tenant>): Promise<Tenant>;
  getUsers(): Promise<TeamMember[]>;
  inviteUser(payload: InvitePayload): Promise<TeamMember>;

  // Data Sources & Ingestion
  getDataSources(): Promise<DataSource[]>;
  getDataSource(id: string): Promise<DataSource>;
  uploadDataSource(file: File | { name: string; size: number; format: string }): Promise<DataSource>;
  retryDataSource(id: string): Promise<DataSource>;

  // Entities & Review Queue
  getEntities(params?: { type?: string; q?: string }): Promise<Entity[]>;
  getEntity(id: string): Promise<Entity>;
  getEntityTimeline(entityId: string): Promise<BusinessEvent[]>;
  getReviewQueue(): Promise<ReviewQueueItem[]>;
  mergeEntity(payload: MergePayload): Promise<{ success: boolean; surviving_entity_id: string }>;
  rejectMerge(id: string): Promise<{ success: boolean }>;

  // Mistakes (Discrepancies)
  getMistakes(params?: { status?: string; type?: string; severity?: string }): Promise<Mistake[]>;
  getMistake(id: string): Promise<Mistake>;
  updateMistakeStatus(id: string, status: MistakeStatus, reason?: string): Promise<Mistake>;
  assignMistake(id: string, userId: string): Promise<Mistake>;

  // Dashboard, Search & Notifications
  getDashboardSummary(): Promise<DashboardSummary>;
  search(query: string, type?: string): Promise<SearchResponse>;
  getNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;

  // Audit & Retention & Billing
  getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]>;
  getRetentionPolicies(): Promise<RetentionPolicy[]>;
  updateRetentionPolicy(id: string, days: number): Promise<RetentionPolicy>;
  getSubscription(): Promise<Subscription>;
  getInvoices(): Promise<Invoice[]>;
  checkoutSubscription(planTier: string): Promise<{ session_id: string; plan_tier: string; amount_minor: number; status: string }>;
}
