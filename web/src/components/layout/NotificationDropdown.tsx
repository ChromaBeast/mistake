"use client";

import React, { useState } from "react";
import { Bell, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";

export function NotificationDropdown() {
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: "notif-1",
      title: "New High Severity Discrepancy",
      desc: "₹2.5L quantity variance flagged in Tata Steel PO-9921",
      icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
      time: "10m ago",
    },
    {
      id: "notif-2",
      title: "Ingestion Batch Completed",
      desc: "1,420 SAP records processed successfully",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      time: "2h ago",
    },
    {
      id: "notif-3",
      title: "Entity Merge Review Required",
      desc: "Tata Steels B2B Ltd queued for canonical resolution",
      icon: <FileText className="h-4 w-4 text-indigo-500" />,
      time: "4h ago",
    },
  ];

  const items = notifications.map((n) => ({
    id: n.id,
    label: `${n.title} - ${n.desc}`,
    icon: n.icon,
    onClick: () => {
      if (unreadCount > 0) setUnreadCount(unreadCount - 1);
    },
  }));

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      }
      items={items}
    />
  );
}
