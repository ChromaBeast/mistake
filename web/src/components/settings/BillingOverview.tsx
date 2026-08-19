import React from "react";
import { Subscription, Invoice } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { formatDate } from "@/lib/formatters/date";
import { CreditCard, CheckCircle2, Download } from "lucide-react";

interface BillingOverviewProps {
  subscription: Subscription;
  invoices: Invoice[];
  onUpgrade?: (tierId: string) => Promise<void>;
  isUpgrading?: boolean;
}

export function BillingOverview({
  subscription,
  invoices,
  onUpgrade,
  isUpgrading,
}: BillingOverviewProps) {
  const currentTier = (subscription?.plan_tier || "growth").toLowerCase();

  const tiers = [
    {
      id: "starter",
      name: "Starter",
      price_minor: 499900,
      description: "For single-unit manufacturing & distributors up to 500 invoices/mo.",
    },
    {
      id: "growth",
      name: "Growth",
      price_minor: 1499900,
      description: "For multi-tier enterprises with real-time discrepancy detection & timeline.",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price_minor: 4999900,
      description: "Custom ERP pipelines, SLA guarantees, and dedicated compliance vault.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t) => {
          const isCurrent = currentTier === t.id;
          return (
            <Card
              key={t.id}
              className={`flex flex-col justify-between ${
                isCurrent ? "border-primary ring-2 ring-primary/20 bg-card" : "bg-card"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{t.name}</CardTitle>
                  {isCurrent && <Badge variant="success">Current Plan</Badge>}
                </div>
                <div className="pt-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {formatPaiseToINR(t.price_minor, { showDecimals: false })}
                  </span>
                  <span className="text-xs text-muted-foreground"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <p className="text-xs text-muted-foreground">{t.description}</p>
                <Button
                  size="sm"
                  variant={isCurrent ? "outline" : "primary"}
                  className="w-full"
                  disabled={isCurrent || isUpgrading}
                  isLoading={isUpgrading && !isCurrent}
                  onClick={() => onUpgrade?.(t.id)}
                >
                  {isCurrent ? "Active Subscription" : "Upgrade Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>Billing History & GST Invoices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono tabular-nums text-xs font-semibold text-foreground">
                    {inv.invoice_number}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-xs text-muted-foreground">
                    {formatDate(inv.issued_at)}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-xs font-semibold text-foreground">
                    {formatPaiseToINR(inv.amount_minor)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
