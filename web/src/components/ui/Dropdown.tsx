"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-52 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center space-x-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors text-left",
                item.danger
                  ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
