package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"time"
)

func (s *MemoryStore) RecordAhaEvent(ctx context.Context, ev *domain.AhaEvent) error {
	if err := verifyTenant(ctx, ev.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if ev.CreatedAt.IsZero() {
		ev.CreatedAt = time.Now().UTC()
	}
	s.ahaEvents[ev.TenantID] = append(s.ahaEvents[ev.TenantID], ev)
	return nil
}

func (s *MemoryStore) GetAhaFunnelSummary(ctx context.Context, tenantID string) (*domain.AhaFunnelSummary, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	summary := &domain.AhaFunnelSummary{
		TenantID: tenantID,
	}

	var totalUploadDuration, totalFindingDuration, totalVerifyDuration int64
	var uploadCount, findingCount, verifyCount int

	events := s.ahaEvents[tenantID]
	for _, ev := range events {
		switch ev.EventType {
		case domain.AhaEventFirstUpload:
			totalUploadDuration += ev.DurationMs
			uploadCount++
		case domain.AhaEventFirstFinding:
			totalFindingDuration += ev.DurationMs
			findingCount++
		case domain.AhaEventFirstVerify:
			totalVerifyDuration += ev.DurationMs
			verifyCount++
		}
	}

	if uploadCount > 0 {
		summary.AvgTimeToUploadSec = float64(totalUploadDuration) / float64(uploadCount*1000)
	}
	if findingCount > 0 {
		summary.AvgTimeToFindingSec = float64(totalFindingDuration) / float64(findingCount*1000)
	}
	if verifyCount > 0 {
		summary.AvgTimeToVerifySec = float64(totalVerifyDuration) / float64(verifyCount*1000)
	}

	summary.TotalUploads = len(s.dataSources)
	for _, m := range s.mistakes {
		if m.TenantID == tenantID && m.Status == domain.MistakeStatusVerified {
			summary.TotalVerifiedMistakes++
		}
	}

	if summary.TotalUploads > 0 {
		summary.AhaConversionRate = float64(summary.TotalVerifiedMistakes) / float64(summary.TotalUploads)
	}

	return summary, nil
}
