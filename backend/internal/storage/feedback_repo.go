package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"time"
)

func (s *MemoryStore) CreateFeedback(ctx context.Context, f *domain.MistakeFeedback) error {
	if err := verifyTenant(ctx, f.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if f.CreatedAt.IsZero() {
		f.CreatedAt = time.Now().UTC()
	}
	s.feedback[f.ID] = f
	return nil
}

func (s *MemoryStore) GetFeedbackByMistake(ctx context.Context, tenantID, mistakeID string) (*domain.MistakeFeedback, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, fb := range s.feedback {
		if fb.TenantID == tenantID && fb.MistakeID == mistakeID {
			cp := *fb
			return &cp, nil
		}
	}
	return nil, ErrNotFound
}

func (s *MemoryStore) GetFeedbackMetrics(ctx context.Context, tenantID string) (*domain.FeedbackMetrics, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	metrics := &domain.FeedbackMetrics{
		TenantID: tenantID,
	}

	for _, fb := range s.feedback {
		if fb.TenantID != tenantID {
			continue
		}
		metrics.TotalReviewed++
		switch fb.FeedbackType {
		case domain.FeedbackAccurate:
			metrics.AccurateCount++
		case domain.FeedbackNotAccurate:
			metrics.NotAccurateCount++
		case domain.FeedbackNotSure:
			metrics.NotSureCount++
		}
	}

	if metrics.TotalReviewed > 0 {
		metrics.FalsePositiveRate = float64(metrics.NotAccurateCount) / float64(metrics.TotalReviewed)
		metrics.AccuracyRate = float64(metrics.AccurateCount) / float64(metrics.TotalReviewed)
	}

	return metrics, nil
}
