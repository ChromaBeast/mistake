"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Tenant, LoginPayload, SignupPayload } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const currentUser = await api.getCurrentUser();
        const currentTenant = await api.getTenant();
        setUser(currentUser);
        setTenant(currentTenant);
      } catch (err) {
        console.warn("No active session:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await api.login(payload);
    setUser(res.user);
    const t = await api.getTenant();
    setTenant(t);
  };

  const signup = async (payload: SignupPayload) => {
    const res = await api.signup(payload);
    setUser(res.user);
    setTenant(res.tenant);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        login,
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
