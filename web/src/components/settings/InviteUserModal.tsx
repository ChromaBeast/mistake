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
}

export function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("Analyst");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles: { value: UserRole; label: string }[] = [
    { value: "Admin", label: "Admin - Full configuration access" },
    { value: "Manager", label: "Manager - Triage & assignments" },
    { value: "Analyst", label: "Analyst - Workspace review & verify" },
    { value: "Viewer", label: "Viewer - Read-only dashboard access" },
  ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const resetAndClose = () => {
    setEmail("");
    setName("");
    setRole("Analyst");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onInvite({ email: email.trim(), name: name.trim() || undefined, role });
      resetAndClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The invitation could not be sent. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
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
          error={email.length > 0 && !emailValid ? "Enter a valid work email address." : undefined}
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

        {error && (
          <p role="alert" className="text-xs text-rose-500 px-1">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
          <Button size="sm" variant="ghost" type="button" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isSubmitting} disabled={!emailValid}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
