package detection

import (
	"context"
	"fmt"
	"math"
	"sort"
	"time"

	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

type LeadTimeAnomalyDetector struct {
	store storage.Store
}

func NewLeadTimeAnomalyDetector(s storage.Store) *LeadTimeAnomalyDetector {
	return &LeadTimeAnomalyDetector{store: s}
}

// MinimumCompletedCycles enforces the validation gate before statistical forecasting is activated.
const MinimumCompletedCycles = 20

func (d *LeadTimeAnomalyDetector) Detect(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	shipments, err := d.store.ListShipments(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var completedLeadTimes []float64
	for _, sh := range shipments {
		if sh.ShippedAt != nil && sh.DeliveredAt != nil && sh.DeliveredAt.After(*sh.ShippedAt) {
			days := sh.DeliveredAt.Sub(*sh.ShippedAt).Hours() / 24.0
			completedLeadTimes = append(completedLeadTimes, days)
		}
	}

	// Gate: Do not forecast on insufficient data (<20 cycles)
	if len(completedLeadTimes) < MinimumCompletedCycles {
		return nil, nil
	}

	sort.Float64s(completedLeadTimes)
	n := len(completedLeadTimes)
	q1 := completedLeadTimes[n/4]
	q3 := completedLeadTimes[(3*n)/4]
	iqr := q3 - q1
	upperBound := q3 + (1.5 * iqr)

	var findings []*domain.Mistake
	now := time.Now().UTC()

	for _, sh := range shipments {
		if sh.DeliveredAt == nil && sh.ShippedAt != nil {
			elapsedDays := now.Sub(*sh.ShippedAt).Hours() / 24.0
			if elapsedDays > upperBound {
				explanation := fmt.Sprintf(
					"Shipment #%s has elapsed %.1f days in transit, exceeding historical 1.5x IQR threshold (%.1f days, median: %.1f).",
					sh.ShipmentNumber, elapsedDays, upperBound, completedLeadTimes[n/2],
				)
				m := &domain.Mistake{
					ID:                   fmt.Sprintf("mst-anomaly-sh-%s", sh.ID),
					TenantID:             tenantID,
					MistakeType:          domain.MistakeTypeLeadTimeAnomaly,
					Severity:             domain.SeverityHigh,
					Status:               domain.MistakeStatusDetected,
					AffectedEntityType:   "shipment",
					AffectedEntityID:     sh.ID,
					ReferenceNumber:      sh.ShipmentNumber,
					FinancialImpactMinor: 0,
					Currency:             "INR",
					Confidence:           math.Min(0.90, 0.70+(float64(n)/100.0)),
					Explanation:          explanation,
					RecommendedAction:    "Contact carrier proactively to investigate transit bottleneck before SLA breach.",
					DetectedAt:           now,
					CreatedAt:            now,
					UpdatedAt:            now,
				}
				findings = append(findings, m)
			}
		}
	}

	return findings, nil
}
