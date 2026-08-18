"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Tenant, LoginPayload, SignupPayload, LoginResponse, MfaVerifyPayload } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  verifyMfa: (payload: MfaVerifyPayload) => Promise<LoginResponse>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const currentUser = await api.getCurrentUser();
        const currentTenant = await api.getTenant();
        setUser(currentUser);
        setTenant(currentTenant);
        if (currentUser?.email?.includes("acmemfg.in") || currentUser?.id?.startsWith("usr-")) {
          setIsDemoMode(true);
        }
      } catch (err) {
        console.warn("No active session:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.login(payload);
    if (!res.requires_mfa) {
      setUser(res.user);
      if ((res as any).is_demo || payload.email.includes("acmemfg.in")) {
        setIsDemoMode(true);
      }
      if (res.tenant) {
        setTenant(res.tenant);
      } else {
        const t = await api.getTenant().catch(() => null);
        if (t) setTenant(t);
      }
    }
    return res;
  };

  const verifyMfa = async (payload: MfaVerifyPayload): Promise<LoginResponse> => {
    const res = await api.verifyMfa(payload);
    setUser(res.user);
    if (res.tenant) {
      setTenant(res.tenant);
    } else {
      const t = await api.getTenant().catch(() => null);
      if (t) setTenant(t);
    }
    return res;
  };

  const signup = async (payload: SignupPayload) => {
    const res = await api.signup(payload);
    setUser(res.user);
    setTenant(res.tenant);
    if ((res as any).is_demo) {
      setIsDemoMode(true);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setTenant(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        isDemoMode,
        login,
        verifyMfa,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
