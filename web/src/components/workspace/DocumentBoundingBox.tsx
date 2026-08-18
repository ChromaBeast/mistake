import React from "react";
import { BoundingBox } from "@/types";

interface DocumentBoundingBoxProps {
  box: BoundingBox;
  label?: string;
  isHighlighted?: boolean;
}

export function DocumentBoundingBox({
  box,
  label,
  isHighlighted = true,
}: DocumentBoundingBoxProps) {
  // Clamp coordinates to [0, 0, 100%, 100%]
  const top = Math.max(0, Math.min(100, box.top));
  const left = Math.max(0, Math.min(100, box.left));
  const width = Math.max(0, Math.min(100 - left, box.width));
  const height = Math.max(0, Math.min(100 - top, box.height));

  return (
    <div
      className={`absolute transition-all rounded border-2 pointer-events-none ${
        isHighlighted
          ? "border-rose-500 bg-rose-500/15 shadow-sm"
          : "border-indigo-500 bg-indigo-500/10"
      }`}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
    >
      {label && (
        <span className="absolute -top-5 left-0 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider font-mono shadow-sm">
          {label}
        </span>
      )}
    </div>
  );
}
