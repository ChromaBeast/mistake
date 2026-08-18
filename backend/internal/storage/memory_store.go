package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"sync"
)

type MemoryStore struct {
	mu sync.RWMutex

	tenants            map[string]*domain.Tenant
	users              map[string]*domain.User        // userID -> user
	usersByEmail           map[string]*domain.User        // email -> user
	sessions               map[string]*domain.Session     // token -> session
	sessionsByRefreshToken map[string]*domain.Session     // refreshToken -> session
	dataSources            map[string]*domain.DataSource  // id -> ds
	documents          map[string]*domain.Document    // id -> doc
	evidence           map[string]*domain.Evidence    // id -> ev
	evidenceByHash     map[string]*domain.Evidence    // docHash+extVer+modelVer -> ev
	entities           map[string]*domain.Entity      // id -> entity
	aliases            map[string]*domain.EntityAlias // id -> alias
	products           map[string]*domain.Product     // entityID -> product
	reviewQueue        map[string]*domain.ReviewQueueItem // id -> item
	orders             map[string]*domain.Order       // id -> order
	purchaseOrders     map[string]*domain.PurchaseOrder // id -> po
	invoices           map[string]*domain.Invoice     // id -> inv
	payments           map[string]*domain.Payment     // id -> payment
	shipments          map[string]*domain.Shipment    // id -> shipment
	mistakes           map[string]*domain.Mistake     // id -> mistake
	mistakeTransitions []*domain.MistakeTransition
	events             []*domain.Event
	auditLogs          []*domain.AuditLog
	retentionPolicies  map[string]*domain.RetentionPolicy // tenantID -> policy
	subscriptions      map[string]*domain.Subscription    // tenantID -> sub
	billingInvoices    map[string][]*domain.BillingInvoice // tenantID -> invoices
	notifications      map[string][]*domain.Notification   // tenantID:userID -> notifs
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		tenants:           make(map[string]*domain.Tenant),
		users:             make(map[string]*domain.User),
		usersByEmail:           make(map[string]*domain.User),
		sessions:               make(map[string]*domain.Session),
		sessionsByRefreshToken: make(map[string]*domain.Session),
		dataSources:            make(map[string]*domain.DataSource),
		documents:         make(map[string]*domain.Document),
		evidence:          make(map[string]*domain.Evidence),
		evidenceByHash:    make(map[string]*domain.Evidence),
		entities:          make(map[string]*domain.Entity),
		aliases:           make(map[string]*domain.EntityAlias),
		products:          make(map[string]*domain.Product),
		reviewQueue:       make(map[string]*domain.ReviewQueueItem),
		orders:            make(map[string]*domain.Order),
		purchaseOrders:    make(map[string]*domain.PurchaseOrder),
		invoices:          make(map[string]*domain.Invoice),
		payments:          make(map[string]*domain.Payment),
		shipments:         make(map[string]*domain.Shipment),
		mistakes:          make(map[string]*domain.Mistake),
		retentionPolicies: make(map[string]*domain.RetentionPolicy),
		subscriptions:     make(map[string]*domain.Subscription),
		billingInvoices:   make(map[string][]*domain.BillingInvoice),
		notifications:     make(map[string][]*domain.Notification),
	}
}

// verifyTenant ensures tenantID is provided and context matches if set.
func verifyTenant(ctx context.Context, tenantID string) error {
	if tenantID == "" {
		return ErrTenantMismatch
	}
	ctxTenant, ok := ctx.Value("tenant_id").(string)
	if ok && ctxTenant != "" && ctxTenant != tenantID {
		return ErrTenantMismatch
	}
	return nil
}
