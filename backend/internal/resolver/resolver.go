package resolver

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"sync/atomic"
	"time"
)

var idCounter int64

const (
	AutoMergeThreshold   = 0.95
	ReviewQueueThreshold = 0.70
)

type ResolutionAction string

const (
	ActionExactMatch  ResolutionAction = "exact_match"
	ActionAutoMerged  ResolutionAction = "auto_merged"
	ActionReviewQueue ResolutionAction = "review_queue"
	ActionCreatedNew  ResolutionAction = "created_new"
)

type ResolutionResult struct {
	EntityID      string           `json:"entity_id"`
	CanonicalName string           `json:"canonical_name"`
	EntityType    domain.EntityType `json:"entity_type"`
	Action        ResolutionAction `json:"action"`
	Confidence    float64          `json:"confidence"`
	ReviewItemID  string           `json:"review_item_id,omitempty"`
}

type EntityResolver struct {
	store storage.Store
}

func NewEntityResolver(store storage.Store) *EntityResolver {
	return &EntityResolver{store: store}
}

func (r *EntityResolver) Resolve(ctx context.Context, tenantID string, eType domain.EntityType, rawName string, evidenceID string) (*ResolutionResult, error) {
	if rawName == "" {
		return nil, fmt.Errorf("entity name cannot be empty")
	}

	// 1. Check existing alias match
	if alias, err := r.store.GetAliasByName(ctx, tenantID, rawName); err == nil {
		entity, err := r.store.GetEntity(ctx, tenantID, alias.EntityID)
		if err == nil && entity.Status == domain.EntityStatusActive {
			return &ResolutionResult{
				EntityID: entity.ID, CanonicalName: entity.CanonicalName,
				EntityType: entity.EntityType, Action: ActionExactMatch, Confidence: 1.0,
			}, nil
		}
	}

	// 2. Fetch active entities of matching type
	entities, err := r.store.ListEntities(ctx, tenantID, &eType)
	if err != nil {
		return nil, err
	}

	var bestEntity *domain.Entity
	var bestScore float64

	for _, e := range entities {
		score := CalculateSimilarity(rawName, e.CanonicalName)
		if score > bestScore {
			bestScore = score
			bestEntity = e
		}
	}

	now := time.Now().UTC()
	seq := atomic.AddInt64(&idCounter, 1)

	// 3. Evaluate threshold
	if bestScore >= AutoMergeThreshold && bestEntity != nil {
		aliasID := fmt.Sprintf("alias-%d-%d", now.UnixNano(), seq)
		_ = r.store.CreateAlias(ctx, &domain.EntityAlias{
			ID: aliasID, EntityID: bestEntity.ID, TenantID: tenantID,
			AliasName: rawName, SourceEvidenceID: evidenceID,
			Confidence: bestScore, CreatedAt: now,
		})
		return &ResolutionResult{
			EntityID: bestEntity.ID, CanonicalName: bestEntity.CanonicalName,
			EntityType: bestEntity.EntityType, Action: ActionAutoMerged, Confidence: bestScore,
		}, nil
	}

	if bestScore >= ReviewQueueThreshold && bestEntity != nil {
		reviewID := fmt.Sprintf("rev-%d-%d", now.UnixNano(), seq)
		item := &domain.ReviewQueueItem{
			ID: reviewID, TenantID: tenantID, RawName: rawName,
			EntityType: eType, MatchedEntityID: bestEntity.ID,
			MatchedCanonical: bestEntity.CanonicalName, Confidence: bestScore,
			SourceEvidenceID: evidenceID, CreatedAt: now,
		}
		_ = r.store.AddToReviewQueue(ctx, item)
		return &ResolutionResult{
			EntityID: bestEntity.ID, CanonicalName: bestEntity.CanonicalName,
			EntityType: eType, Action: ActionReviewQueue, Confidence: bestScore,
			ReviewItemID: reviewID,
		}, nil
	}

	// 4. Create new canonical entity
	entityID := fmt.Sprintf("ent-%d-%d", now.UnixNano(), seq)
	newEntity := &domain.Entity{
		ID: entityID, TenantID: tenantID, EntityType: eType,
		CanonicalName: rawName, Status: domain.EntityStatusActive,
		CreatedAt: now, UpdatedAt: now,
	}
	if err := r.store.CreateEntity(ctx, newEntity); err != nil {
		return nil, err
	}
	_ = r.store.CreateAlias(ctx, &domain.EntityAlias{
		ID: fmt.Sprintf("alias-%d-%d", now.UnixNano(), seq), EntityID: entityID,
		TenantID: tenantID, AliasName: rawName, SourceEvidenceID: evidenceID,
		Confidence: 1.0, CreatedAt: now,
	})

	return &ResolutionResult{
		EntityID: entityID, CanonicalName: rawName,
		EntityType: eType, Action: ActionCreatedNew, Confidence: 1.0,
	}, nil
}
