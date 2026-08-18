package detection

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"strings"
	"time"
)

type StatusMismatchDetector struct {
	store storage.Store
}

func NewStatusMismatchDetector(s storage.Store) *StatusMismatchDetector {
	return &StatusMismatchDetector{store: s}
}

func (d *StatusMismatchDetector) Detect(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	orders, err := d.store.ListOrders(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	shipments, err := d.store.ListShipments(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	shipmentByOrder := make(map[string]*domain.Shipment)
	for _, sh := range shipments {
		if sh.OrderID != "" {
			shipmentByOrder[sh.OrderID] = sh
		}
	}

	var findings []*domain.Mistake
	now := time.Now().UTC()

	for _, order := range orders {
		sh, hasShipment := shipmentByOrder[order.ID]
		if !hasShipment {
			continue
		}

		oStatus := strings.ToLower(order.Status)
		shStatus := strings.ToLower(sh.Status)

		if (oStatus == "completed" || oStatus == "delivered") && (shStatus == "returned" || shStatus == "failed" || shStatus == "cancelled") {
			explanation := fmt.Sprintf(
				"Contradictory state: Order #%s is marked as '%s' in ERP, but Shipment #%s has status '%s' in logistics tracking.",
				order.OrderNumber, order.Status, sh.ShipmentNumber, sh.Status,
			)
			m := &domain.Mistake{
				ID:                   fmt.Sprintf("mst-stat-%s-%s", order.ID, sh.ID),
				TenantID:             tenantID,
				MistakeType:          domain.MistakeTypeStatusMismatch,
				Severity:             domain.SeverityHigh,
				Status:               domain.MistakeStatusDetected,
				AffectedEntityType:   "order",
				AffectedEntityID:     order.ID,
				ReferenceNumber:      order.OrderNumber,
				FinancialImpactMinor: order.TotalAmountMinor,
				Currency:             "INR",
				Confidence:           0.97,
				Explanation:          explanation,
				RecommendedAction:    "Verify physical inventory and update ERP record to prevent wrongful revenue recognition.",
				DetectedAt:           now,
				CreatedAt:            now,
				UpdatedAt:            now,
			}
			findings = append(findings, m)
		}
	}
	return findings, nil
}
