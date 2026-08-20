"use client";

import { useEffect, useRef } from "react";

export type AhaEventType =
  | "time_to_first_upload"
  | "time_to_first_finding"
  | "time_to_first_verify"
  | "time_to_first_dismiss";

export function useAhaAnalytics() {
  const startTimeRef = useRef<number>(Date.now());

  const trackMilestone = async (eventType: AhaEventType, metadata?: string) => {
    const durationMs = Date.now() - startTimeRef.current;
    try {
      await fetch("/api/proxy/api/v1/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          duration_ms: durationMs,
          metadata: metadata || "",
        }),
      });
    } catch {
      // Non-blocking telemetry
    }
  };

  return { trackMilestone };
}
