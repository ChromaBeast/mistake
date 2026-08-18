package handlers

import (
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/resolver"
	"mistake-backend/internal/storage"
	"net/http"
)

type EntityHandler struct {
	store        storage.Store
	reviewQueue  *resolver.ReviewQueueService
}

func NewEntityHandler(store storage.Store) *EntityHandler {
	return &EntityHandler{
		store:       store,
		reviewQueue: resolver.NewReviewQueueService(store),
	}
}

type MergeRequest struct {
	TargetEntityID string `json:"target_entity_id,omitempty"`
	ReviewItemID   string `json:"review_item_id,omitempty"`
}

func (h *EntityHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	typeParam := r.URL.Query().Get("entity_type")
	var eType *domain.EntityType
	if typeParam != "" {
		t := domain.EntityType(typeParam)
		eType = &t
	}

	entities, err := h.store.ListEntities(r.Context(), tenantID, eType)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, entities)
}

func (h *EntityHandler) Get(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "entities")
	entity, err := h.store.GetEntity(r.Context(), tenantID, id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Entity not found")
		return
	}
	aliases, _ := h.store.ListAliases(r.Context(), tenantID, id)
	var aliasNames []string
	for _, a := range aliases {
		aliasNames = append(aliasNames, a.AliasName)
	}
	entity.Aliases = aliasNames
	RespondJSON(w, http.StatusOK, entity)
}

func (h *EntityHandler) ListReviewQueue(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	items, err := h.store.ListReviewQueue(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, items)
}

func (h *EntityHandler) ConfirmMerge(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	entityID := extractURLParam(r.URL.Path, "entities")

	var req MergeRequest
	_ = ParseJSON(r, &req)

	if req.ReviewItemID != "" {
		if err := h.reviewQueue.ConfirmMerge(r.Context(), tenantID, req.ReviewItemID); err != nil {
			RespondError(w, http.StatusBadRequest, "MERGE_FAILED", err.Error())
			return
		}
	} else if req.TargetEntityID != "" {
		if err := h.store.MergeEntities(r.Context(), tenantID, entityID, req.TargetEntityID); err != nil {
			RespondError(w, http.StatusBadRequest, "MERGE_FAILED", err.Error())
			return
		}
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Entity merged successfully"})
}

func (h *EntityHandler) RejectMerge(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	var req MergeRequest
	_ = ParseJSON(r, &req)

	if req.ReviewItemID != "" {
		if err := h.reviewQueue.RejectMerge(r.Context(), tenantID, req.ReviewItemID); err != nil {
			RespondError(w, http.StatusBadRequest, "REJECT_FAILED", err.Error())
			return
		}
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Merge proposal rejected"})
}
