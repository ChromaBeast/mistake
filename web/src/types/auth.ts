import { Tenant } from "./tenant";

export type UserRole = "Owner" | "Admin" | "Manager" | "Analyst" | "Viewer";

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: UserRole;
  is_mfa_enabled?: boolean;
  avatar_url?: string;
  /** True when served from the evaluation sandbox dataset. */
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  tenant_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  user_agent?: string;
  ip_address?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface SignupPayload {
  email: string;
  password?: string;
  name: string;
  company_name: string;
}

export interface MfaVerifyPayload {
  mfa_token: string;
  code: string;
}

/** Response returned by the login endpoint. */
export interface LoginResponse {
  /** Present once authentication is fully established (absent while MFA is pending). */
  user?: User;
  tenant?: Tenant;
  requires_mfa?: boolean;
  mfa_token?: string;
  is_demo?: boolean;
}

/** Response returned by the signup endpoint. */
export interface SignupResponse {
  user: User;
  tenant: Tenant;
  is_demo?: boolean;
}
