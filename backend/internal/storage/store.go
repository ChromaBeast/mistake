package storage

import (
	"context"
	"errors"
	"mistake-backend/internal/domain"
	"time"
)

var (
	ErrNotFound       = errors.New("record not found")
	ErrAlreadyExists  = errors.New("record already exists")
	ErrTenantMismatch = errors.New("tenant mismatch violation")
	ErrUnauthorized   = errors.New("unauthorized")
)

type ListFilter struct {
	Cursor string
	Limit  int
}

type MistakeFilter struct {
	Severity    domain.Severity
	Status      domain.MistakeStatus
	MistakeType domain.MistakeType
	AssignedTo  string
	Cursor      string
	Limit       int
}

type EventFilter struct {
	EntityID  string
	EventType domain.EventType
	From      *time.Time
	To        *time.Time
	Cursor    string
	Limit     int
}

type AuditFilter struct {
	ActorUserID  string
	Action       string
	ResourceType string
	From         *time.Time
	To           *time.Time
	Limit        int
}

type DashboardSummary struct {
	TotalValueAtRiskMinor int64                  `json:"total_value_at_risk_minor"`
	TotalDiscrepancies    int                    `json:"total_discrepancies"`
	ActiveMistakes        int                    `json:"active_mistakes"`
	ResolvedMistakes      int                    `json:"resolved_mistakes"`
	BySeverity            map[string]int         `json:"by_severity"`
	ByStatus              map[string]int         `json:"by_status"`
	ByType                map[string]int         `json:"by_type"`
	MonthlyLeakageTrend   []MonthlyTrend         `json:"monthly_leakage_trend"`
}

type MonthlyTrend struct {
	Month       string `json:"month"`
	AmountMinor int64  `json:"amount_minor"`
	Count       int    `json:"count"`
}

type SearchResult struct {
	ID          string `json:"id"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Snippet     string `json:"snippet"`
	ReferenceID string `json:"reference_id,omitempty"`
}

type Store interface {
	// Tenant & User operations
	CreateTenant(ctx context.Context, t *domain.Tenant) error
	GetTenant(ctx context.Context, tenantID string) (*domain.Tenant, error)
	UpdateTenant(ctx context.Context, t *domain.Tenant) error
	CreateUser(ctx context.Context, u *domain.User) error
	GetUserByID(ctx context.Context, tenantID, userID string) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	ListUsers(ctx context.Context, tenantID string) ([]*domain.User, error)
	UpdateUserRole(ctx context.Context, tenantID, userID string, role domain.UserRole) error
	UpdateUserStatus(ctx context.Context, tenantID, userID string, status domain.UserStatus) error
	CreateSession(ctx context.Context, s *domain.Session) error
	GetSession(ctx context.Context, token string) (*domain.Session, error)
	GetSessionByRefreshToken(ctx context.Context, refreshToken string) (*domain.Session, error)
	RotateSession(ctx context.Context, oldRefreshToken, newAccessToken, newRefreshToken string, accessExp, refreshExp time.Time) (*domain.Session, error)
	ListSessions(ctx context.Context, tenantID string) ([]*domain.Session, error)
	RevokeSession(ctx context.Context, tenantID, sessionID string) error

	// Data Source & Evidence
	CreateDataSource(ctx context.Context, ds *domain.DataSource) error
	GetDataSource(ctx context.Context, tenantID, id string) (*domain.DataSource, error)
	ListDataSources(ctx context.Context, tenantID string) ([]*domain.DataSource, error)
	UpdateDataSource(ctx context.Context, ds *domain.DataSource) error
	CreateDocument(ctx context.Context, doc *domain.Document) error
	GetDocument(ctx context.Context, tenantID, id string) (*domain.Document, error)
	ListDocuments(ctx context.Context, tenantID, dsID string) ([]*domain.Document, error)
	CreateEvidence(ctx context.Context, ev *domain.Evidence) error
	GetEvidence(ctx context.Context, tenantID, id string) (*domain.Evidence, error)
	ListEvidenceByDocument(ctx context.Context, tenantID, docID string) ([]*domain.Evidence, error)
	GetEvidenceByHash(ctx context.Context, tenantID, docHash, extVer, modelVer string) (*domain.Evidence, error)

	// Entity operations
	CreateEntity(ctx context.Context, e *domain.Entity) error
	GetEntity(ctx context.Context, tenantID, id string) (*domain.Entity, error)
	GetEntityByCanonical(ctx context.Context, tenantID string, eType domain.EntityType, name string) (*domain.Entity, error)
	ListEntities(ctx context.Context, tenantID string, eType *domain.EntityType) ([]*domain.Entity, error)
	UpdateEntity(ctx context.Context, e *domain.Entity) error
	CreateAlias(ctx context.Context, a *domain.EntityAlias) error
	ListAliases(ctx context.Context, tenantID, entityID string) ([]*domain.EntityAlias, error)
	GetAliasByName(ctx context.Context, tenantID string, name string) (*domain.EntityAlias, error)
	AddToReviewQueue(ctx context.Context, item *domain.ReviewQueueItem) error
	ListReviewQueue(ctx context.Context, tenantID string) ([]*domain.ReviewQueueItem, error)
	RemoveFromReviewQueue(ctx context.Context, tenantID, id string) error
	MergeEntities(ctx context.Context, tenantID, survivorID, targetID string) error

	// Business objects
	CreateOrder(ctx context.Context, o *domain.Order) error
	GetOrder(ctx context.Context, tenantID, id string) (*domain.Order, error)
	ListOrders(ctx context.Context, tenantID string) ([]*domain.Order, error)
	CreatePurchaseOrder(ctx context.Context, po *domain.PurchaseOrder) error
	GetPurchaseOrder(ctx context.Context, tenantID, id string) (*domain.PurchaseOrder, error)
	ListPurchaseOrders(ctx context.Context, tenantID string) ([]*domain.PurchaseOrder, error)
	CreateInvoice(ctx context.Context, inv *domain.Invoice) error
	GetInvoice(ctx context.Context, tenantID, id string) (*domain.Invoice, error)
	ListInvoices(ctx context.Context, tenantID string) ([]*domain.Invoice, error)
	CreatePayment(ctx context.Context, p *domain.Payment) error
	ListPayments(ctx context.Context, tenantID string) ([]*domain.Payment, error)
	CreateShipment(ctx context.Context, s *domain.Shipment) error
	ListShipments(ctx context.Context, tenantID string) ([]*domain.Shipment, error)

	// Mistakes
	CreateMistake(ctx context.Context, m *domain.Mistake) error
	GetMistake(ctx context.Context, tenantID, id string) (*domain.Mistake, error)
	ListMistakes(ctx context.Context, tenantID string, filter MistakeFilter) ([]*domain.Mistake, error)
	UpdateMistakeStatus(ctx context.Context, tenantID, id string, status domain.MistakeStatus, changedBy, reason string) error
	AssignMistake(ctx context.Context, tenantID, id, assignedTo, assignedToName string) error
	ListMistakeTransitions(ctx context.Context, tenantID, mistakeID string) ([]*domain.MistakeTransition, error)
	GetDashboardSummary(ctx context.Context, tenantID string) (*DashboardSummary, error)

	// Events & Timeline
	CreateEvent(ctx context.Context, ev *domain.Event) error
	ListEvents(ctx context.Context, tenantID string, filter EventFilter) ([]*domain.Event, error)
	GetEntityTimeline(ctx context.Context, tenantID, entityID string) ([]*domain.Event, error)

	// Audit, Retention, Billing, Notifications, Search
	CreateAuditLog(ctx context.Context, log *domain.AuditLog) error
	ListAuditLogs(ctx context.Context, tenantID string, filter AuditFilter) ([]*domain.AuditLog, error)
	GetRetentionPolicy(ctx context.Context, tenantID string) (*domain.RetentionPolicy, error)
	UpdateRetentionPolicy(ctx context.Context, p *domain.RetentionPolicy) error
	PurgeTenantData(ctx context.Context, tenantID string) error
	GetSubscription(ctx context.Context, tenantID string) (*domain.Subscription, error)
	UpdateSubscription(ctx context.Context, s *domain.Subscription) error
	CreateBillingInvoice(ctx context.Context, inv *domain.BillingInvoice) error
	ListBillingInvoices(ctx context.Context, tenantID string) ([]*domain.BillingInvoice, error)
	CreateNotification(ctx context.Context, n *domain.Notification) error
	ListNotifications(ctx context.Context, tenantID, userID string) ([]*domain.Notification, error)
	MarkNotificationRead(ctx context.Context, tenantID, id string) error
	GlobalSearch(ctx context.Context, tenantID, query, entityType string) ([]*SearchResult, error)
}
