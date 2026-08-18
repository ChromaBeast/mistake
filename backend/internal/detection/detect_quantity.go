package detection

import (
	"context"
	"fmt"
	"math"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/financial"
	"mistake-backend/internal/storage"
	"time"
)

type QuantityMismatchDetector struct {
	store storage.Store
}

func NewQuantityMismatchDetector(s storage.Store) *QuantityMismatchDetector {
	return &QuantityMismatchDetector{store: s}
}

func (d *QuantityMismatchDetector) Detect(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	orders, err := d.store.ListOrders(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	invoices, err := d.store.ListInvoices(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var findings []*domain.Mistake
	invByOrder := make(map[string]*domain.Invoice)
	for _, inv := range invoices {
		if inv.RelatedOrderID != "" {
			invByOrder[inv.RelatedOrderID] = inv
		}
	}

	for _, order := range orders {
		inv, hasInv := invByOrder[order.ID]
		if !hasInv {
			continue
		}

		for _, oLine := range order.Lines {
			for _, iLine := range inv.Lines {
				if oLine.ProductName == iLine.ProductName || (oLine.ProductID != "" && oLine.ProductID == iLine.ProductID) {
					if math.Abs(oLine.Quantity-iLine.Quantity) > 0.001 {
						impact := financial.CalcQuantityMismatchImpact(oLine.Quantity, iLine.Quantity, iLine.UnitPriceMinor)
						sev := CalculateSeverity(impact, 0)
						now := time.Now().UTC()
						explanation := fmt.Sprintf(
							"Quantity mismatch detected on Order #%s vs Invoice #%s for item '%s'. Ordered: %.2f, Invoiced: %.2f. Financial difference: %s.",
							order.OrderNumber, inv.InvoiceNumber, oLine.ProductName, oLine.Quantity, iLine.Quantity, financial.FormatPaise(impact),
						)
						m := &domain.Mistake{
							ID:                   fmt.Sprintf("mst-qty-%s-%s", order.ID, inv.ID),
							TenantID:             tenantID,
							MistakeType:          domain.MistakeTypeQuantityMismatch,
							Severity:             sev,
							Status:               domain.MistakeStatusDetected,
							AffectedEntityType:   "customer",
							AffectedEntityID:     order.CustomerID,
							AffectedEntityName:   order.CustomerName,
							ReferenceNumber:      order.OrderNumber,
							FinancialImpactMinor: impact,
							Currency:             "INR",
							Confidence:           0.99,
							Explanation:          explanation,
							RecommendedAction:    "Issue a debit/credit note or verify warehouse dispatch slip.",
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
