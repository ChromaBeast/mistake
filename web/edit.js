const fs = require('fs');
const path = 'c:/Users/sheer/Documents/antigravity/proud-curie/web/src/lib/api/http.ts';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace('import {', 'import {\n  LoginResponse,\n  SignupResponse,');

// Base URL
content = content.replace('private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";', 'private baseUrl = "/api/proxy";');

// Request method
const oldRequest = `private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(\`\${this.baseUrl}\${path}\`, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || \`HTTP \${res.status}: \${res.statusText}\`);
    }
    return res.json();
  }`;

const newRequest = `private async request<T>(path: string, options: RequestInit = {}, serverToken?: string): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(serverToken ? { Authorization: \`Bearer \${serverToken}\` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const url = path.startsWith("/api/") ? path : \`\${this.baseUrl}\${path}\`;

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || \`HTTP \${res.status}: \${res.statusText}\`);
    }
    return res.json();
  }`;

content = content.replace(oldRequest, newRequest);

// Signup, Login, Logout, getCurrentUser
content = content.replace(
  `async signup(payload: SignupPayload) {
    return this.request<{ token: string; user: User; tenant: Tenant }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }`,
  `/**
   * Signs up a new user and tenant.
   */
  async signup(payload: SignupPayload) {
    return this.request<SignupResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }`
);

content = content.replace(
  `async login(payload: LoginPayload) {
    return this.request<{ token: string; user: User; requires_mfa?: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }`,
  `/**
   * Logs in a user.
   */
  async login(payload: LoginPayload) {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }`
);

content = content.replace(
  `async logout() {
    await this.request<void>("/auth/logout", { method: "POST" });
  }`,
  `/**
   * Logs out the current user.
   */
  async logout() {
    await this.request<void>("/api/auth/logout", { method: "POST" });
  }`
);

content = content.replace(
  `async getCurrentUser() {
    return this.request<User>("/auth/me");
  }`,
  `/**
   * Gets the current authenticated user.
   */
  async getCurrentUser() {
    return this.request<User>("/api/auth/me");
  }`
);

// uploadDataSource
const oldUpload = `async uploadDataSource(file: File | { name: string; size: number; format: string }) {
    const formData = new FormData();
    if (file instanceof File) formData.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const res = await fetch(\`\${this.baseUrl}/data-sources\`, {
      method: "POST",
      headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    return res.json();
  }`;

const newUpload = `/**
   * Uploads a data source file.
   */
  async uploadDataSource(file: File | { name: string; size: number; format: string }) {
    const formData = new FormData();
    if (file instanceof File) formData.append("file", file);
    const res = await fetch(\`\${this.baseUrl}/data-sources\`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    return res.json();
  }`;

content = content.replace(oldUpload, newUpload);

// Adding rudimentary TSDoc to other methods
const methods = [
  ['async verifyMfa', '/**\n   * Verifies MFA token.\n   */\n  async verifyMfa'],
  ['async getTenant', '/**\n   * Gets the current tenant.\n   */\n  async getTenant'],
  ['async updateTenant', '/**\n   * Updates the current tenant.\n   */\n  async updateTenant'],
  ['async getUsers', '/**\n   * Gets users for the tenant.\n   */\n  async getUsers'],
  ['async inviteUser', '/**\n   * Invites a new user.\n   */\n  async inviteUser'],
  ['async getDataSources', '/**\n   * Gets data sources.\n   */\n  async getDataSources'],
  ['async getDataSource', '/**\n   * Gets a specific data source.\n   */\n  async getDataSource'],
  ['async retryDataSource', '/**\n   * Retries processing a data source.\n   */\n  async retryDataSource'],
  ['async getEntities', '/**\n   * Gets entities.\n   */\n  async getEntities'],
  ['async getEntity(', '/**\n   * Gets a specific entity.\n   */\n  async getEntity('],
  ['async getEntityTimeline', '/**\n   * Gets an entity timeline.\n   */\n  async getEntityTimeline'],
  ['async getReviewQueue', '/**\n   * Gets the review queue.\n   */\n  async getReviewQueue'],
  ['async mergeEntity', '/**\n   * Merges entities.\n   */\n  async mergeEntity'],
  ['async rejectMerge', '/**\n   * Rejects a merge suggestion.\n   */\n  async rejectMerge'],
  ['async getMistakes', '/**\n   * Gets mistakes.\n   */\n  async getMistakes'],
  ['async getMistake(', '/**\n   * Gets a specific mistake.\n   */\n  async getMistake('],
  ['async updateMistakeStatus', '/**\n   * Updates a mistake status.\n   */\n  async updateMistakeStatus'],
  ['async assignMistake', '/**\n   * Assigns a mistake.\n   */\n  async assignMistake'],
  ['async getDashboardSummary', '/**\n   * Gets the dashboard summary.\n   */\n  async getDashboardSummary'],
  ['async search', '/**\n   * Searches across the tenant.\n   */\n  async search'],
  ['async getAuditLogs', '/**\n   * Gets audit logs.\n   */\n  async getAuditLogs'],
  ['async getRetentionPolicies', '/**\n   * Gets retention policies.\n   */\n  async getRetentionPolicies'],
  ['async updateRetentionPolicy', '/**\n   * Updates a retention policy.\n   */\n  async updateRetentionPolicy'],
  ['async getSubscription', '/**\n   * Gets the current subscription.\n   */\n  async getSubscription'],
  ['async getInvoices', '/**\n   * Gets invoices.\n   */\n  async getInvoices'],
];

for (const [find, replace] of methods) {
  content = content.replace(find, replace);
}

fs.writeFileSync(path, content);
console.log("Done");
