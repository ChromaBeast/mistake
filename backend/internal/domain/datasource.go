package domain

import "time"

type DataSourceStatus string

const (
	DataSourceStatusQueued     DataSourceStatus = "queued"
	DataSourceStatusProcessing DataSourceStatus = "processing"
	DataSourceStatusExtracting DataSourceStatus = "extracting"
	DataSourceStatusAnalyzing  DataSourceStatus = "analyzing"
	DataSourceStatusCompleted  DataSourceStatus = "completed"
	DataSourceStatusFailed     DataSourceStatus = "failed"
)

type SourceType string

const (
	SourceTypeCSV         SourceType = "csv"
	SourceTypeXLSX        SourceType = "xlsx"
	SourceTypePDF         SourceType = "pdf"
	SourceTypeEmailExport SourceType = "email_export"
	SourceTypeERPExport   SourceType = "erp_export"
	SourceTypeManual      SourceType = "manual"
)

type DataSource struct {
	ID           string           `json:"id"`
	TenantID     string           `json:"tenant_id"`
	UploadedBy   string           `json:"uploaded_by"`
	SourceType   SourceType       `json:"source_type"`
	Filename     string           `json:"filename"`
	StorageKey   string           `json:"storage_key"`
	FileHash     string           `json:"file_hash"`
	Status       DataSourceStatus `json:"status"`
	ErrorMessage string           `json:"error_message,omitempty"`
	ItemCount    int              `json:"item_count"`
	UploadedAt   time.Time        `json:"uploaded_at"`
	ProcessedAt  *time.Time       `json:"processed_at,omitempty"`
}

type DocumentType string

const (
	DocTypeOrder        DocumentType = "order"
	DocTypePO           DocumentType = "po"
	DocTypeInvoice      DocumentType = "invoice"
	DocTypeShipmentNote DocumentType = "shipment_note"
	DocTypeEmail        DocumentType = "email"
	DocTypeUnknown      DocumentType = "unknown"
)

type Document struct {
	ID           string       `json:"id"`
	TenantID     string       `json:"tenant_id"`
	DataSourceID string       `json:"data_source_id"`
	DocumentType DocumentType `json:"document_type"`
	PageCount    int          `json:"page_count"`
	ContentHash  string       `json:"content_hash"`
	CreatedAt    time.Time    `json:"created_at"`
}
