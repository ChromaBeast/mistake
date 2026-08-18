package pipeline

import (
	"context"
	"fmt"
	"log/slog"
	"mistake-backend/internal/domain"
	"time"
)

func (p *Pipeline) ingestBusinessObject(
	ctx context.Context,
	tenantID string,
	fact *domain.ExtractedFact,
	entityID, evID string,
	now time.Time,
) error {
	num, _ := fact.Data["number"].(string)
	qty, _ := fact.Data["quantity"].(float64)
	priceMinor, _ := fact.Data["unit_price_minor"].(int64)
	prodName, _ := fact.Data["product_name"].(string)
	status, _ := fact.Data["status"].(string)
	if status == "" {
		status = "active"
	}

	switch fact.FactType {
	case "order":
		if err := p.store.CreateOrder(ctx, &domain.Order{
			ID:               fmt.Sprintf("ord-%s", num),
			TenantID:         tenantID,
			CustomerID:       entityID,
			CustomerName:     fact.EntityName,
			OrderNumber:      num,
			Status:           status,
			Currency:         "INR",
			TotalAmountMinor: int64(qty * float64(priceMinor)),
			OccurredAt:       &now,
			ObservedAt:       now,
			SourceEvidenceID: evID,
			Lines: []domain.OrderLine{{
				ID:             fmt.Sprintf("oline-%s", num),
				OrderID:        fmt.Sprintf("ord-%s", num),
				TenantID:       tenantID,
				ProductName:    prodName,
				Quantity:       qty,
				UnitPriceMinor: priceMinor,
			}},
			CreatedAt: now,
		}); err != nil {
			slog.Error("Failed to create order", "error", err)
			return err
		}
	case "po", "purchase_order":
		if err := p.store.CreatePurchaseOrder(ctx, &domain.PurchaseOrder{
			ID:               fmt.Sprintf("po-%s", num),
			TenantID:         tenantID,
			SupplierID:       entityID,
			SupplierName:     fact.EntityName,
			PONumber:         num,
			Status:           status,
			Currency:         "INR",
			TotalAmountMinor: int64(qty * float64(priceMinor)),
			OccurredAt:       &now,
			ObservedAt:       now,
			SourceEvidenceID: evID,
			Lines: []domain.POLine{{
				ID:              fmt.Sprintf("poline-%s", num),
				PurchaseOrderID: fmt.Sprintf("po-%s", num),
				TenantID:        tenantID,
				ProductName:     prodName,
				Quantity:        qty,
				UnitPriceMinor:  priceMinor,
			}},
			CreatedAt: now,
		}); err != nil {
			slog.Error("Failed to create purchase order", "error", err)
			return err
		}
	case "invoice":
		if err := p.store.CreateInvoice(ctx, &domain.Invoice{
			ID:               fmt.Sprintf("inv-%s", num),
			TenantID:         tenantID,
			InvoiceNumber:    num,
			AmountMinor:      int64(qty * float64(priceMinor)),
			Currency:         "INR",
			Status:           status,
			IssuedAt:         &now,
			ObservedAt:       now,
			SourceEvidenceID: evID,
			Lines: []domain.InvoiceLine{{
				ID:             fmt.Sprintf("invline-%s", num),
				InvoiceID:      fmt.Sprintf("inv-%s", num),
				TenantID:       tenantID,
				ProductName:    prodName,
				Quantity:       qty,
				UnitPriceMinor: priceMinor,
			}},
			CreatedAt: now,
		}); err != nil {
			slog.Error("Failed to create invoice", "error", err)
			return err
		}
	}
	return nil
}
