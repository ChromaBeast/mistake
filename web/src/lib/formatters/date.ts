/**
 * Date and time formatters for B2B timelines and audit logs.
 */

export function formatDate(
  dateInput: string | Date | null | undefined,
  options?: { showTime?: boolean; precision?: "date_only" | "timestamp" }
): string {
  if (!dateInput) return "—";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  if (options?.precision === "date_only") {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " (Date only)";
  }

  if (options?.showTime) {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return formatDate(date);
  }
  if (diffDay > 0) {
    return `${diffDay}d ago`;
  }
  if (diffHour > 0) {
    return `${diffHour}h ago`;
  }
  if (diffMin > 0) {
    return `${diffMin}m ago`;
  }
  return "Just now";
}
