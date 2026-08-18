import React from "react";
import { Cpu, Layers, FlaskConical, Truck } from "lucide-react";

export interface IndustryCheck {
  title: string;
  detail: string;
  auditAction: string;
}

export interface VerticalData {
  id: string;
  icon: React.ElementType;
  sector: string;
  focus: string;
  leakRate: string;
  summary: string;
  checks: IndustryCheck[];
}

export const VERTICALS: VerticalData[] = [
  {
    id: "auto",
    icon: Cpu,
    sector: "Automotive & Engineering",
    focus: "Forgings, Castings & Tier-1 Assemblies",
    leakRate: "2.8% of Direct Spend",
    summary:
      "High component variety and raw material index formulas create frequent billing mismatches between master PO schedules and supplier invoices.",
    checks: [
      {
        title: "Raw Material Index Escalations",
        detail: "Auto-reconciles base metal index price formulas against contract cap clauses.",
        auditAction: "Index Rate Verified",
      },
      {
        title: "Machining Scrap & Core Deductions",
        detail: "Verifies agreed scrap recovery credit offsets before payment release.",
        auditAction: "Scrap Credit Applied",
      },
      {
        title: "Inbound Quality Rejections",
        detail: "Blocks payment for rejected lots until replacement credit notes are matched.",
        auditAction: "QC Debit Note Issued",
      },
    ],
  },
  {
    id: "metals",
    icon: Layers,
    sector: "Steel, Metals & Fabrication",
    focus: "Foundries, Slitters & Structural Mills",
    leakRate: "3.2% of Direct Spend",
    summary:
      "Gross-to-net weighbridge conversions, heat chemistry grade surcharges, and coil slitting scrap generate cumulative decimal rounding drift.",
    checks: [
      {
        title: "Weighbridge Scale Tonnage Mismatch",
        detail: "Compares factory weighbridge slips with mill invoice gross and tare weights.",
        auditAction: "Weight Deficit Held",
      },
      {
        title: "Grade & Heat Chemistry Gaps",
        detail: "Validates metallurgical test certificates against billed grade premiums.",
        auditAction: "Surcharge Validated",
      },
      {
        title: "Coil Slit Width Conversion Losses",
        detail: "Recalculates exact metric tonnage using integer paise standard thickness tables.",
        auditAction: "Paisa Drift Resolved",
      },
    ],
  },
  {
    id: "chem",
    icon: FlaskConical,
    sector: "Chemicals & Process Plants",
    focus: "Bulk Liquids, Polymers & Packaging",
    leakRate: "2.1% of Direct Spend",
    summary:
      "Ambient temperature volume expansion, tanker turnaround demurrage, and purity differentials frequently slip past standard three-way matching.",
    checks: [
      {
        title: "Ambient Temperature Volume Expansion",
        detail: "Normalizes liquid volume at standard 15°C reference temperature.",
        auditAction: "Volume Calibrated",
      },
      {
        title: "Unloading Demurrage Penalties",
        detail: "Cross-checks gate timestamp logs against vendor tanker detention invoices.",
        auditAction: "Demurrage Refuted",
      },
      {
        title: "Purity Concentration Adjustments",
        detail: "Adjusts net billable active substance percentage based on lab assay reports.",
        auditAction: "Assay Adjusted",
      },
    ],
  },
  {
    id: "fmcg",
    icon: Truck,
    sector: "FMCG & Distribution Hubs",
    focus: "Multi-Warehouse Distribution Networks",
    leakRate: "2.4% of Direct Spend",
    summary:
      "High-velocity multi-drop shipments across regional fulfillment centers lead to uncaptured transit shortages and unrealized volume rebates.",
    checks: [
      {
        title: "Volume Rebate Realization",
        detail: "Tracks cumulative monthly purchase thresholds to claim quarterly vendor discounts.",
        auditAction: "Rebate Claimed",
      },
      {
        title: "Multi-City Transit Shortages",
        detail: "Reconciles receiving proofs from individual hubs into a single consolidated claim.",
        auditAction: "Shortage Deducted",
      },
      {
        title: "Unapproved Freight Surcharges",
        detail: "Validates transporter rate cards against bill of lading fuel surcharge formulas.",
        auditAction: "Tariff Enforced",
      },
    ],
  },
];
