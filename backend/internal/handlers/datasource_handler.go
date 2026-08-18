package handlers

import (
	"bytes"
	"fmt"
	"io"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/storage"
	"net/http"
	"strings"
	"time"
)

// DataSourceHandler manages ingestion and querying of data sources and raw documents.
type DataSourceHandler struct {
	store      storage.Store
	pipeline   *pipeline.Pipeline
	workerPool *pipeline.WorkerPool
}

// NewDataSourceHandler creates a new DataSourceHandler instance.
func NewDataSourceHandler(store storage.Store, p *pipeline.Pipeline, wp *pipeline.WorkerPool) *DataSourceHandler {
	return &DataSourceHandler{
		store:      store,
		pipeline:   p,
		workerPool: wp,
	}
}

type CreateDataSourceRequest struct {
	SourceType domain.SourceType `json:"source_type"`
	Filename   string            `json:"filename"`
	Content    string            `json:"content,omitempty"`
}

// Create accepts a file upload or raw JSON content and enqueues it for async processing.
func (h *DataSourceHandler) Create(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	userID := middleware.GetUserID(r.Context())

	var filename string
	var sourceType domain.SourceType
	var fileBytes []byte

	if strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		if err := r.ParseMultipartForm(32 << 20); err != nil {
			RespondError(w, http.StatusBadRequest, "PARSE_ERROR", "Failed to parse multipart form")
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			RespondError(w, http.StatusBadRequest, "FILE_REQUIRED", "No file found in multipart form")
			return
		}
		defer file.Close()
		buf := new(bytes.Buffer)
		_, _ = io.Copy(buf, file)
		fileBytes = buf.Bytes()
		filename = header.Filename
		st, ok := guessSourceType(filename)
		if !ok {
			RespondError(w, http.StatusUnsupportedMediaType, "UNSUPPORTED_MEDIA_TYPE", "Unsupported file type")
			return
		}
		sourceType = st
	} else {
		var req CreateDataSourceRequest
		if err := ParseJSON(r, &req); err != nil || req.Filename == "" {
			RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Filename and source_type are required")
			return
		}
		filename = req.Filename
		st, ok := guessSourceType(filename)
		if !ok {
			RespondError(w, http.StatusUnsupportedMediaType, "UNSUPPORTED_MEDIA_TYPE", "Unsupported file type")
			return
		}
		sourceType = st
		fileBytes = []byte(req.Content)
	}

	if len(fileBytes) == 0 {
		RespondError(w, http.StatusBadRequest, "EMPTY_FILE", "File content cannot be empty")
		return
	}

	dsID := UniqueID("ds")
	now := time.Now().UTC()
	ds := &domain.DataSource{
		ID:         dsID,
		TenantID:   tenantID,
		UploadedBy: userID,
		SourceType: sourceType,
		Filename:   filename,
		StorageKey: fmt.Sprintf("tenants/%s/sources/%s", tenantID, filename),
		Status:     domain.DataSourceStatusQueued,
		UploadedAt: now,
	}

	if err := h.store.CreateDataSource(r.Context(), ds); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	// Enqueue to worker pool for async state progression
	if h.workerPool != nil {
		h.workerPool.Enqueue(tenantID, dsID, fileBytes)
	} else {
		_ = h.pipeline.ProcessDataSource(r.Context(), tenantID, dsID, fileBytes)
	}

	RespondCreated(w, ds)
}

// List returns all data sources associated with the authenticated tenant.
func (h *DataSourceHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	list, err := h.store.ListDataSources(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, list)
}

// Get retrieves details for a single data source by its identifier.
func (h *DataSourceHandler) Get(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "data-sources")
	ds, err := h.store.GetDataSource(r.Context(), tenantID, id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "DataSource not found")
		return
	}
	RespondJSON(w, http.StatusOK, ds)
}

// GetDocument retrieves metadata and content hash for a document.
func (h *DataSourceHandler) GetDocument(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "documents")
	doc, err := h.store.GetDocument(r.Context(), tenantID, id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Document not found")
		return
	}
	RespondJSON(w, http.StatusOK, doc)
}

// GetDocumentEvidence retrieves all granular evidence chunks extracted from a document.
func (h *DataSourceHandler) GetDocumentEvidence(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "documents")
	evidence, err := h.store.ListEvidenceByDocument(r.Context(), tenantID, id)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, evidence)
}

func guessSourceType(filename string) (domain.SourceType, bool) {
	lower := strings.ToLower(filename)
	if strings.HasSuffix(lower, ".csv") {
		return domain.SourceTypeCSV, true
	} else if strings.HasSuffix(lower, ".xlsx") || strings.HasSuffix(lower, ".xls") {
		return domain.SourceTypeXLSX, true
	} else if strings.HasSuffix(lower, ".pdf") {
		return domain.SourceTypePDF, true
	} else if strings.HasSuffix(lower, ".eml") || strings.HasSuffix(lower, ".msg") {
		return domain.SourceTypeEmailExport, true
	} else if strings.HasSuffix(lower, ".json") || strings.HasSuffix(lower, ".txt") {
		return domain.SourceTypeManual, true
	}
	return "", false
}
