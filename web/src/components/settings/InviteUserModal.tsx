"use client";

import React, { useState } from "react";
import { UserRole, InvitePayload } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePayload) => Promise<void>;
  isLoading?: boolean;
}

export function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("Analyst");

  const roles: { value: UserRole; label: string }[] = [
    { value: "Admin", label: "Admin - Full configuration access" },
    { value: "Manager", label: "Manager - Triage & assignments" },
    { value: "Analyst", label: "Analyst - Workspace review & verify" },
    { value: "Viewer", label: "Viewer - Read-only dashboard access" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onInvite({ email, name: name.trim() || undefined, role });
    setEmail("");
    setName("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Send an invitation to join your workspace."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Work Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.in"
          required
        />
        <Input
          label="Full Name (Optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rohan Sharma"
        />
        <Select
          label="Assigned Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={roles}
        />

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
          <Button size="sm" variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isLoading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
