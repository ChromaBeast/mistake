# MISTAKE — DESIGN.MD

> Visual Design System & UI Specification for Mistake (B2B Financial Leakage & Discrepancy Detection Platform).
> Compliant with Google Stitch & Impeccable Design Context specifications.

---

## 1. Design Philosophy: "Audit-Grade Precision"

Mistake is designed for Chief Financial Officers, Controllers, and Supply Chain Directors at heavy industrial and distribution enterprises. The interface must convey absolute mathematical certainty, trust, and structural rigor.

### Core Tenets:
1. **Zero Vibe-Coding Fluff**: No decorative glowing blobs, no floating cartoon badges, no vague marketing buzzwords. Every visual element serves a functional financial purpose.
2. **Tabular Numerals & Monospace Precision**: All financial amounts (₹ INR), quantities, HSN codes, timestamps, and line items use tabular monospace fonts (`font-mono tabular-nums`).
3. **Structured Grid Architecture**: High-contrast hairline borders (`1px border-border`), clean divider lines, and data-dense matrices that reflect financial ledgers and ERP inspection consoles.
4. **Restrained Executive Palette**: Neutral titanium/slate surfaces (`#090D16` dark / `#F8FAFC` light), stark crisp typography, with high-intent semantic accents.

---

## 2. Color Palette & Semantic Tokens

| Token | Light Theme | Dark Theme | Purpose |
|-------|-------------|------------|---------|
| `--background` | `#F8FAFC` | `#090D16` | Main viewport canvas |
| `--card` / `--surface` | `#FFFFFF` | `#101726` | Elevated cards, tables, panels |
| `--foreground` | `#0F172A` | `#F8FAFC` | High-contrast primary text |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Metadata, timestamps, secondary labels |
| `--border` | `#E2E8F0` | `#1E293B` | Structural hairline grid dividers (1px) |
| `--success` / Emerald | `#059669` / `#10B981` | `#10B981` | Reconciled capital, 100% matched evidence |
| `--destructive` / Crimson | `#DC2626` | `#F43F5E` | Active financial leakage, rate violations |
| `--warning` / Amber | `#D97706` | `#F59E0B` | Ambiguous entity matches, missing GRN |
| `--primary` | `#0F172A` | `#F8FAFC` | Executive CTAs, primary action buttons |

---

## 3. Typography Hierarchy

- **Hero & Display**: Clean geometric sans with tight negative tracking (`tracking-tight font-extrabold text-3xl / text-4xl`).
- **Section & Card Headings**: Structured uppercase subheaders with wide tracking (`text-xs uppercase tracking-wider font-semibold text-muted-foreground`) or bold section titles (`text-lg font-bold tracking-tight`).
- **Body & Labels**: High-legibility neutral sans (`text-sm / text-xs leading-relaxed`).
- **Financial & Data Units**: Monospace with tabular numeral spacing (`font-mono tabular-nums font-semibold`).

---

## 4. Component Specifications & State Behaviors

- **Reconciliation Ledger Tables**: Multi-column comparisons (PO Rate vs GRN Gate Volume vs Invoiced Rate vs Net Variance). Row hover highlights (`hover:bg-muted/50 transition-colors duration-150`).
- **Executive Spend Calculator**: Interactive slider with instantaneous EBITDA recovery math.
- **Side-by-Side Evidence Inspector**: Dual-pane document viewer with bounding box highlights and confidence scores.
- **Mobile Floor Scanner**: High-contrast laser alignment guide, ambient lux meter, and offline queue indicator.
- **Empty / Loading / Error States**: Structured empty states with clear action triggers; skeleton loaders with subtle pulse; actionable error boundaries with retry buttons.
