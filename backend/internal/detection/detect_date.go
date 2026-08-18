package detection

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"time"
)

type DateMismatchDetector struct {
	store storage.Store
}

func NewDateMismatchDetector(s storage.Store) *DateMismatchDetector {
	return &DateMismatchDetector{store: s}
}

func (d *DateMismatchDetector) Detect(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	shipments, err := d.store.ListShipments(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var findings []*domain.Mistake
	now := time.Now().UTC()

	for _, sh := range shipments {
		if sh.PromisedDate == nil {
			continue
		}

		var delayDays int
		if sh.DeliveredAt != nil && sh.DeliveredAt.After(*sh.PromisedDate) {
			delayDays = int(sh.DeliveredAt.Sub(*sh.PromisedDate).Hours() / 24)
		} else if sh.DeliveredAt == nil && now.After(*sh.PromisedDate) {
			delayDays = int(now.Sub(*sh.PromisedDate).Hours() / 24)
		}

		if delayDays > 0 {
			sev := CalculateSeverity(0, delayDays)
			explanation := fmt.Sprintf(
				"Shipment #%s is delayed by %d days. Promised delivery: %s.",
				sh.ShipmentNumber, delayDays, sh.PromisedDate.Format("2006-01-02"),
			)
			m := &domain.Mistake{
				ID:                   fmt.Sprintf("mst-date-sh-%s", sh.ID),
				TenantID:             tenantID,
				MistakeType:          domain.MistakeTypeDateMismatch,
				Severity:             sev,
				Status:               domain.MistakeStatusDetected,
				AffectedEntityType:   "shipment",
				AffectedEntityID:     sh.ID,
				ReferenceNumber:      sh.ShipmentNumber,
				FinancialImpactMinor: 0,
				Currency:             "INR",
				Confidence:           0.95,
				Explanation:          explanation,
				RecommendedAction:    "Expedite logistics partner or claim delay penalty per SLA.",
				DetectedAt:           now,
				CreatedAt:            now,
				UpdatedAt:            now,
			}
			findings = append(findings, m)
		}
	}
	return findings, nil
}
