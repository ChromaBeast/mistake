"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Tenant, TeamMember, InvitePayload } from "@/types";
import { TenantProfileForm } from "@/components/settings/TenantProfileForm";
import { TeamRbacTable } from "@/components/settings/TeamRbacTable";
import { InviteUserModal } from "@/components/settings/InviteUserModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Settings, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [t, members] = await Promise.all([api.getTenant(), api.getUsers()]);
      setTenant(t);
      setTeamMembers(members);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTenant = async (data: Partial<Tenant>) => {
    const updated = await api.updateTenant(data);
    setTenant(updated);
  };

  const handleInvite = async (payload: InvitePayload) => {
    const newMember = await api.inviteUser(payload);
    setTeamMembers((prev) => [...prev, newMember]);
  };

  if (isLoading || !tenant) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Workspace Settings & Administration</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure company legal details, team access matrix, and security policies.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/settings/retention">
            <Button size="sm" variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Retention Policies</span>
            </Button>
          </Link>
          <Link href="/settings/billing">
            <Button size="sm" variant="outline" className="flex items-center space-x-1">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Subscription & Billing</span>
            </Button>
          </Link>
        </div>
      </div>

      <TenantProfileForm tenant={tenant} onSave={handleUpdateTenant} />

      <TeamRbacTable
        members={teamMembers}
        onOpenInvite={() => setIsInviteOpen(true)}
      />

      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
