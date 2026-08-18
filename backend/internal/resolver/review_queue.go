package resolver

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"time"
)

// ReviewQueueService manages user actions on pending entity resolution candidates.
type ReviewQueueService struct {
	store storage.Store
}

func NewReviewQueueService(store storage.Store) *ReviewQueueService {
	return &ReviewQueueService{store: store}
}

// ConfirmMerge accepts the proposed match from the review queue and links the alias.
func (s *ReviewQueueService) ConfirmMerge(ctx context.Context, tenantID, queueItemID string) error {
	queueItems, err := s.store.ListReviewQueue(ctx, tenantID)
	if err != nil {
		return err
	}

	var targetItem *domain.ReviewQueueItem
	for _, item := range queueItems {
		if item.ID == queueItemID {
			targetItem = item
			break
		}
	}
	if targetItem == nil {
		return storage.ErrNotFound
	}

	aliasID := fmt.Sprintf("alias-%d", time.Now().UnixNano())
	_ = s.store.CreateAlias(ctx, &domain.EntityAlias{
		ID:               aliasID,
		EntityID:         targetItem.MatchedEntityID,
		TenantID:         tenantID,
		AliasName:        targetItem.RawName,
		SourceEvidenceID: targetItem.SourceEvidenceID,
		Confidence:       targetItem.Confidence,
		CreatedAt:        time.Now().UTC(),
	})

	return s.store.RemoveFromReviewQueue(ctx, tenantID, queueItemID)
}

// RejectMerge rejects the proposed merge and creates a separate canonical entity.
func (s *ReviewQueueService) RejectMerge(ctx context.Context, tenantID, queueItemID string) error {
	queueItems, err := s.store.ListReviewQueue(ctx, tenantID)
	if err != nil {
		return err
	}

	var targetItem *domain.ReviewQueueItem
	for _, item := range queueItems {
		if item.ID == queueItemID {
			targetItem = item
			break
		}
	}
	if targetItem == nil {
		return storage.ErrNotFound
	}

	now := time.Now().UTC()
	entityID := fmt.Sprintf("ent-%d", time.Now().UnixNano())
	newEntity := &domain.Entity{
		ID:            entityID,
		TenantID:      tenantID,
		EntityType:    targetItem.EntityType,
		CanonicalName: targetItem.RawName,
		Status:        domain.EntityStatusActive,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	if err := s.store.CreateEntity(ctx, newEntity); err != nil {
		return err
	}

	_ = s.store.CreateAlias(ctx, &domain.EntityAlias{
		ID:               fmt.Sprintf("alias-%d", time.Now().UnixNano()),
		EntityID:         entityID,
		TenantID:         tenantID,
		AliasName:        targetItem.RawName,
		SourceEvidenceID: targetItem.SourceEvidenceID,
		Confidence:       1.0,
		CreatedAt:        now,
	})

	return s.store.RemoveFromReviewQueue(ctx, tenantID, queueItemID)
}
