package detection

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

type DetectionEngine struct {
	store storage.Store
}

// NewDetectionEngine creates a new DetectionEngine.
func NewDetectionEngine(store storage.Store) *DetectionEngine {
	return &DetectionEngine{store: store}
}

// RunAll executes all 5 discrepancy detection detectors and saves new findings.
func (e *DetectionEngine) RunAll(ctx context.Context, tenantID string) ([]*domain.Mistake, error) {
	var allMistakes []*domain.Mistake

	qDet := NewQuantityMismatchDetector(e.store)
	pDet := NewPriceMismatchDetector(e.store)
	dDet := NewDateMismatchDetector(e.store)
	sDet := NewStatusMismatchDetector(e.store)
	mDet := NewMissingEvidenceDetector(e.store)

	qFindings, err := qDet.Detect(ctx, tenantID)
	if err == nil {
		allMistakes = append(allMistakes, qFindings...)
	}

	pFindings, err := pDet.Detect(ctx, tenantID)
	if err == nil {
		allMistakes = append(allMistakes, pFindings...)
	}

	dFindings, err := dDet.Detect(ctx, tenantID)
	if err == nil {
		allMistakes = append(allMistakes, dFindings...)
	}

	sFindings, err := sDet.Detect(ctx, tenantID)
	if err == nil {
		allMistakes = append(allMistakes, sFindings...)
	}

	mFindings, err := mDet.Detect(ctx, tenantID)
	if err == nil {
		allMistakes = append(allMistakes, mFindings...)
	}

	for _, m := range allMistakes {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}
		// Save mistake if it doesn't already exist
		if _, err := e.store.GetMistake(ctx, tenantID, m.ID); err != nil {
			_ = e.store.CreateMistake(ctx, m)
		}
	}

	return allMistakes, nil
}
