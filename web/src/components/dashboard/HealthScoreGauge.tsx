import React from "react";
import { HealthScore } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";

export function HealthScoreGauge({ healthScore }: { healthScore: HealthScore }) {
  const { score, status, risk_drivers } = healthScore;

  const statusConfig = {
    healthy: {
      label: "Healthy Posture",
      badgeVariant: "success" as const,
      color: "#10B981",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
    },
    moderate: {
      label: "Moderate Risk",
      badgeVariant: "warning" as const,
      color: "#F59E0B",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    },
    critical: {
      label: "High Leakage Risk",
      badgeVariant: "danger" as const,
      color: "#F43F5E",
      icon: <ShieldX className="h-5 w-5 text-rose-500" />,
    },
  };

  const current = statusConfig[status] || statusConfig.healthy;

  // Arc calculation for SVG circular gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Business Health Score</CardTitle>
        <Badge variant={current.badgeVariant}>{current.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-2 pb-6 space-y-4">
        <div className="relative flex items-center justify-center">
          <svg className="h-32 w-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-secondary"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className="transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={current.color}
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {score}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">/ 100</span>
          </div>
        </div>

        <div className="w-full space-y-1.5 pt-2 border-t border-border/60">
          <p className="text-xs font-medium text-muted-foreground">Primary Risk Drivers:</p>
          <ul className="space-y-1">
            {risk_drivers.map((driver, i) => (
              <li key={i} className="text-xs text-foreground flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
