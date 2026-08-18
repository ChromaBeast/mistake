# PRODUCT.MD — Mistake

> Strategic product context, positioning, and durable design constraints for **Mistake** (Impeccable Context Specification).

---

## 1. Product Identity & Target Audience

### Who is this product for?
- **Chief Financial Officers & Corporate Controllers**: Overseeing ₹500Cr+ enterprise spend across manufacturing, distribution, and heavy industrial supply chains in India. They require macro-level EBITDA leakage recovery metrics, deterministic proof, and compliance auditability.
- **Supply Chain & Procurement Directors**: Managing high-volume purchase orders (POs), multi-vendor rate contracts, and delivery SLA enforcement.
- **Plant Gate Logistics Auditors & Inward Receiving Inspectors**: Operating on factory floors and warehouse gates with mobile devices under harsh lighting and variable connectivity to verify physical Gate Inward / GRN quantities against dispatch challans and POs in real-time.

---

## 2. Core Value Proposition & Positioning

### What does Mistake make possible?
- **Sub-Paisa Mathematical Precision**: Every calculation uses exact integer minor units (paise) to guarantee that financial leakages (rate variance, quantity shortfalls, duplicate billing, missing credit notes, retroactive rate changes) are caught down to ₹0.01 without floating-point rounding errors.
- **Continuous 4-Way Cross-Document Reconciliation**: Connects ERP POs, physical Gate Inward/GRN records, vendor Tax Invoices, and banking payment records into an automated 5-stage ingestion pipeline.
- **Audit-Grade Traceability**: Tamper-evident side-by-side evidence inspection where every detected discrepancy is tied to the exact source document bounding box, file hash, and immutable audit trail.

### What neighboring products cannot truthfully claim:
- Generic accounting tools provide post-facto ledger summaries; Mistake provides pre-payment active leakage intervention and factory-gate physical validation.
- Standard OCR tools only extract text; Mistake reconciles extracted facts against canonical entity graphs and temporal contract histories with mandatory resolution reason tracking.

---

## 3. Durable Design Constraints & Tenets

1. **Zero AI Slop**:
   - No decorative purple/pink gradients on dark backgrounds.
   - No meaningless floating badges, non-standard cards, or icon-stuffed bento boxes.
   - Every pixel must earn its place on the screen with structural purpose.

2. **Tabular Numerals & High Density**:
   - All financial numbers (₹ INR in Crores, Lakhs, Thousands, Paise), HSN codes, timestamps, and line-item variances MUST render in tabular monospace (`font-mono tabular-nums`).
   - Tables and matrices use high-contrast 1px divider borders (`border-border`), structured columns, and clear visual hierarchy.

3. **Semantic Status Colors**:
   - **Emerald (`#10B981`)**: Verified, reconciled, recovered capital.
   - **Crimson / Amber (`#F43F5E` / `#F59E0B`)**: Active leakage, quantity shortage, rate discrepancy, unverified vendor alias.
   - **Slate / Titanium (`#090D16` / `#F8FAFC`)**: Structural chrome, hairline dividers, neutral executive surfaces.

4. **Multi-Platform Responsiveness & Offline Resilience**:
   - **Web**: High-density desktop workspace with split-pane side-by-side evidence viewing and instant keyboard navigation (`Cmd+K`).
   - **Mobile**: Factory-floor ready with high-contrast laser inspection overlay, multi-page document capture, swipeable triage gestures, and offline-first queue replay sync.
