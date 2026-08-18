import React from "react";
import { TeamMember, UserRole } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserPlus, Shield } from "lucide-react";

interface TeamRbacTableProps {
  members: TeamMember[];
  onOpenInvite: () => void;
}

export function TeamRbacTable({ members, onOpenInvite }: TeamRbacTableProps) {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Owner":
        return <Badge variant="danger" size="sm">Owner</Badge>;
      case "Admin":
        return <Badge variant="warning" size="sm">Admin</Badge>;
      case "Manager":
        return <Badge variant="info" size="sm">Manager</Badge>;
      case "Analyst":
        return <Badge variant="success" size="sm">Analyst</Badge>;
      default:
        return <Badge variant="outline" size="sm">Viewer</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Team & Role-Based Access (RBAC)</h3>
          <p className="text-xs text-muted-foreground">Manage user permissions and team invitations.</p>
        </div>
        <Button size="sm" onClick={onOpenInvite} className="flex items-center space-x-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Invite Member</span>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-semibold text-xs text-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-foreground">
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {m.email}
                </TableCell>
                <TableCell>{getRoleBadge(m.role)}</TableCell>
                <TableCell>
                  <Badge variant={m.status === "active" ? "success" : "default"} size="sm">
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="text-xs">
                    Edit Role
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
