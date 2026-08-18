package domain

import "time"

type EventType string

const (
	EventOrderCreated         EventType = "order.created"
	EventOrderQuantityChanged EventType = "order.quantity.changed"
	EventOrderPriceChanged    EventType = "order.price.changed"
	EventOrderStatusChanged   EventType = "order.status.changed"
	EventPOCreated            EventType = "purchase_order.created"
	EventInvoiceCreated       EventType = "invoice.created"
	EventInvoiceAmountChanged EventType = "invoice.amount.changed"
	EventPaymentCreated       EventType = "payment.created"
	EventShipmentCreated      EventType = "shipment.created"
	EventShipmentStatusChanged EventType = "shipment.status.changed"
	EventDocumentUploaded     EventType = "document.uploaded"
	EventDocumentProcessed    EventType = "document.processed"
	EventEntityCreated        EventType = "entity.created"
	EventEntityMerged         EventType = "entity.merged"
	EventMistakeDetected      EventType = "mistake.detected"
	EventMistakeVerified      EventType = "mistake.verified"
	EventMistakeDismissed     EventType = "mistake.dismissed"
	EventMistakeResolved      EventType = "mistake.resolved"
)

type Event struct {
	ID           string                 `json:"id"`
	TenantID     string                 `json:"tenant_id"`
	EntityID     string                 `json:"entity_id,omitempty"`
	EventType    EventType              `json:"event_type"`
	EventVersion int                    `json:"event_version"`
	Source       string                 `json:"source"`
	OccurredAt   *time.Time             `json:"occurred_at,omitempty"`
	ObservedAt   time.Time              `json:"observed_at"`
	Payload      map[string]interface{} `json:"payload"`
	EvidenceID   string                 `json:"evidence_id,omitempty"`
	Confidence   float64                `json:"confidence"`
	CreatedAt    time.Time              `json:"created_at"`
}
