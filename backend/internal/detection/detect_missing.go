package detection

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"time"
)

type MissingEvidenceDetector struct {
	store storage.Store
}

func NewMissingEvidenceDetector(s storage.Store) *MissingEvidenceDetector {
	return &MissingEvidenceDetector{store: s}
}

func (d *MissingEvidenceDetector) Detect(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	invoices, err := d.store.ListInvoices(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	payments, err := d.store.ListPayments(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var findings []*domain.Mistake
	now := time.Now().UTC()

	// 1. Orphan Invoices (no Order or PO link)
	for _, inv := range invoices {
		if inv.RelatedOrderID == "" && inv.RelatedPOID == "" {
			sev := CalculateSeverity(inv.AmountMinor, 0)
			explanation := fmt.Sprintf(
				"Orphan Invoice #%s found with amount %s without any matching Purchase Order or Sales Order.",
				inv.InvoiceNumber, fmt.Sprintf("₹%.2f", float64(inv.AmountMinor)/100.0),
			)
			m := &domain.Mistake{
				ID:                   fmt.Sprintf("mst-mis-inv-%s", inv.ID),
				TenantID:             tenantID,
				MistakeType:          domain.MistakeTypeMissingEvidence,
				Severity:             sev,
				Status:               domain.MistakeStatusDetected,
				AffectedEntityType:   "invoice",
				AffectedEntityID:     inv.ID,
				ReferenceNumber:      inv.InvoiceNumber,
				FinancialImpactMinor: inv.AmountMinor,
				Currency:             "INR",
				Confidence:           0.94,
				Explanation:          explanation,
				RecommendedAction:    "Upload the corresponding PO/contract or audit rogue procurement spend.",
				DetectedAt:           now,
				CreatedAt:            now,
				UpdatedAt:            now,
			}
			findings = append(findings, m)
		}
	}

	// 2. Unallocated Payments (missing invoice_id)
	for _, p := range payments {
		if p.InvoiceID == "" {
			sev := CalculateSeverity(p.AmountMinor, 0)
			explanation := fmt.Sprintf(
				"Unallocated Payment record found with amount %s missing associated invoice link.",
				fmt.Sprintf("₹%.2f", float64(p.AmountMinor)/100.0),
			)
			m := &domain.Mistake{
				ID:                   fmt.Sprintf("mst-mis-pay-%s", p.ID),
				TenantID:             tenantID,
				MistakeType:          domain.MistakeTypeMissingEvidence,
				Severity:             sev,
				Status:               domain.MistakeStatusDetected,
				AffectedEntityType:   "payment",
				AffectedEntityID:     p.ID,
				FinancialImpactMinor: p.AmountMinor,
				Currency:             "INR",
				Confidence:           0.90,
				Explanation:          explanation,
				RecommendedAction:    "Reconcile bank statement with open accounts receivable/payable ledger.",
				DetectedAt:           now,
				CreatedAt:            now,
				UpdatedAt:            now,
			}
			findings = append(findings, m)
		}
	}

	return findings, nil
}
