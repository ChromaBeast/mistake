package domain

import "time"

type Order struct {
	ID               string      `json:"id"`
	TenantID         string      `json:"tenant_id"`
	CustomerID       string      `json:"customer_id"`
	CustomerName     string      `json:"customer_name,omitempty"`
	OrderNumber      string      `json:"order_number"`
	Status           string      `json:"status"`
	Currency         string      `json:"currency"`
	TotalAmountMinor int64       `json:"total_amount_minor"`
	OccurredAt       *time.Time  `json:"occurred_at,omitempty"`
	ObservedAt       time.Time   `json:"observed_at"`
	SourceEvidenceID string      `json:"source_evidence_id,omitempty"`
	Lines            []OrderLine `json:"lines,omitempty"`
	CreatedAt        time.Time   `json:"created_at"`
}

type OrderLine struct {
	ID             string  `json:"id"`
	OrderID        string  `json:"order_id"`
	TenantID       string  `json:"tenant_id"`
	ProductID      string  `json:"product_id,omitempty"`
	ProductName    string  `json:"product_name,omitempty"`
	Quantity       float64 `json:"quantity"`
	UnitPriceMinor int64   `json:"unit_price_minor"`
}

type PurchaseOrder struct {
	ID               string    `json:"id"`
	TenantID         string    `json:"tenant_id"`
	SupplierID       string    `json:"supplier_id"`
	SupplierName     string    `json:"supplier_name,omitempty"`
	PONumber         string    `json:"po_number"`
	Status           string    `json:"status"`
	Currency         string    `json:"currency"`
	TotalAmountMinor int64     `json:"total_amount_minor"`
	OccurredAt       *time.Time `json:"occurred_at,omitempty"`
	ObservedAt       time.Time `json:"observed_at"`
	SourceEvidenceID string    `json:"source_evidence_id,omitempty"`
	Lines            []POLine  `json:"lines,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

type POLine struct {
	ID              string  `json:"id"`
	PurchaseOrderID string  `json:"purchase_order_id"`
	TenantID        string  `json:"tenant_id"`
	ProductID       string  `json:"product_id,omitempty"`
	ProductName     string  `json:"product_name,omitempty"`
	Quantity        float64 `json:"quantity"`
	UnitPriceMinor  int64   `json:"unit_price_minor"`
}

type Invoice struct {
	ID               string        `json:"id"`
	TenantID         string        `json:"tenant_id"`
	RelatedOrderID   string        `json:"related_order_id,omitempty"`
	RelatedPOID      string        `json:"related_po_id,omitempty"`
	SupplierID       string        `json:"supplier_id,omitempty"`
	CustomerID       string        `json:"customer_id,omitempty"`
	InvoiceNumber    string        `json:"invoice_number"`
	AmountMinor      int64         `json:"amount_minor"`
	Currency         string        `json:"currency"`
	Status           string        `json:"status"`
	IssuedAt         *time.Time    `json:"issued_at,omitempty"`
	ObservedAt       time.Time     `json:"observed_at"`
	SourceEvidenceID string        `json:"source_evidence_id,omitempty"`
	Lines            []InvoiceLine `json:"lines,omitempty"`
	CreatedAt        time.Time     `json:"created_at"`
}

type InvoiceLine struct {
	ID             string  `json:"id"`
	InvoiceID      string  `json:"invoice_id"`
	TenantID       string  `json:"tenant_id"`
	ProductID      string  `json:"product_id,omitempty"`
	ProductName    string  `json:"product_name,omitempty"`
	Quantity       float64 `json:"quantity"`
	UnitPriceMinor int64   `json:"unit_price_minor"`
}

type Payment struct {
	ID               string     `json:"id"`
	TenantID         string     `json:"tenant_id"`
	InvoiceID        string     `json:"invoice_id,omitempty"`
	AmountMinor      int64      `json:"amount_minor"`
	Currency         string     `json:"currency"`
	Method           string     `json:"method,omitempty"`
	PaidAt           *time.Time `json:"paid_at,omitempty"`
	SourceEvidenceID string     `json:"source_evidence_id,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}

type Shipment struct {
	ID               string     `json:"id"`
	TenantID         string     `json:"tenant_id"`
	OrderID          string     `json:"order_id,omitempty"`
	POID             string     `json:"po_id,omitempty"`
	ShipmentNumber   string     `json:"shipment_number,omitempty"`
	Status           string     `json:"status"`
	PromisedDate     *time.Time `json:"promised_date,omitempty"`
	ShippedAt        *time.Time `json:"shipped_at,omitempty"`
	DeliveredAt      *time.Time `json:"delivered_at,omitempty"`
	SourceEvidenceID string     `json:"source_evidence_id,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}
