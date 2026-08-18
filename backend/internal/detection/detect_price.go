package detection

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/financial"
	"mistake-backend/internal/storage"
	"time"
)

type PriceMismatchDetector struct {
	store storage.Store
}

func NewPriceMismatchDetector(s storage.Store) *PriceMismatchDetector {
	return &PriceMismatchDetector{store: s}
}

func (d *PriceMismatchDetector) Detect(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	pos, err := d.store.ListPurchaseOrders(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	invoices, err := d.store.ListInvoices(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var findings []*domain.Mistake
	invByPO := make(map[string]*domain.Invoice)
	for _, inv := range invoices {
		if inv.RelatedPOID != "" {
			invByPO[inv.RelatedPOID] = inv
		}
	}

	for _, po := range pos {
		inv, hasInv := invByPO[po.ID]
		if !hasInv {
			continue
		}

		for _, pLine := range po.Lines {
			for _, iLine := range inv.Lines {
				if pLine.ProductName == iLine.ProductName || (pLine.ProductID != "" && pLine.ProductID == iLine.ProductID) {
					if pLine.UnitPriceMinor != iLine.UnitPriceMinor {
						impact := financial.CalcPriceMismatchImpact(pLine.UnitPriceMinor, iLine.UnitPriceMinor, iLine.Quantity)
						sev := CalculateSeverity(impact, 0)
						now := time.Now().UTC()
						explanation := fmt.Sprintf(
							"Unit price discrepancy detected on PO #%s vs Invoice #%s for item '%s'. Agreed PO rate: %s, Invoiced rate: %s across %.2f units. Variance: %s.",
							po.PONumber, inv.InvoiceNumber, pLine.ProductName,
							financial.FormatPaise(pLine.UnitPriceMinor), financial.FormatPaise(iLine.UnitPriceMinor),
							iLine.Quantity, financial.FormatPaise(impact),
						)
						m := &domain.Mistake{
							ID:                   fmt.Sprintf("mst-prc-%s-%s", po.ID, inv.ID),
							TenantID:             tenantID,
							MistakeType:          domain.MistakeTypePriceMismatch,
							Severity:             sev,
							Status:               domain.MistakeStatusDetected,
							AffectedEntityType:   "supplier",
							AffectedEntityID:     po.SupplierID,
							AffectedEntityName:   po.SupplierName,
							ReferenceNumber:      po.PONumber,
							FinancialImpactMinor: impact,
							Currency:             "INR",
							Confidence:           0.98,
							Explanation:          explanation,
							RecommendedAction:    "Request revised invoice or supplier credit note matching rate contract.",
							DetectedAt:           now,
							CreatedAt:            now,
							UpdatedAt:            now,
						}
						findings = append(findings, m)
					}
				}
			}
		}
	}
	return findings, nil
}
