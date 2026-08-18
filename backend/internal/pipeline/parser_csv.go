package pipeline

import (
	"encoding/csv"
	"io"
	"mistake-backend/internal/domain"
	"strconv"
	"strings"
	"time"
)

// CSVParser parses CSV and TSV formatted business files.
type CSVParser struct{}

func NewCSVParser() *CSVParser {
	return &CSVParser{}
}

func (p *CSVParser) Parse(r io.Reader, delimiter rune) ([]*domain.ExtractedFact, error) {
	reader := csv.NewReader(r)
	if delimiter != 0 {
		reader.Comma = delimiter
	}
	reader.TrimLeadingSpace = true

	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	if len(records) < 2 {
		return nil, nil
	}

	header := records[0]
	headerMap := make(map[string]int)
	for idx, col := range header {
		headerMap[strings.ToLower(strings.TrimSpace(col))] = idx
	}

	var facts []*domain.ExtractedFact
	now := time.Now().UTC()

	for rowIdx, row := range records[1:] {
		fact := p.parseRow(row, headerMap, rowIdx+2, now)
		if fact != nil {
			facts = append(facts, fact)
		}
	}
	return facts, nil
}

func (p *CSVParser) parseRow(row []string, headers map[string]int, lineNum int, now time.Time) *domain.ExtractedFact {
	getVal := func(keys ...string) string {
		for _, k := range keys {
			if idx, ok := headers[k]; ok && idx < len(row) {
				return strings.TrimSpace(row[idx])
			}
		}
		return ""
	}

	docType := getVal("type", "doc_type", "document_type")
	number := getVal("number", "order_number", "po_number", "invoice_number", "shipment_number")
	entityName := getVal("entity_name", "customer", "supplier", "vendor", "partner")
	product := getVal("product", "item", "sku", "description")
	qtyStr := getVal("qty", "quantity", "units")
	priceStr := getVal("price", "unit_price", "rate", "amount")
	status := getVal("status")

	qty, _ := strconv.ParseFloat(qtyStr, 64)
	priceVal, _ := strconv.ParseFloat(priceStr, 64)
	priceMinor := int64(priceVal * 100) // Convert rupees to paise

	if docType == "" {
		if strings.HasPrefix(strings.ToUpper(number), "PO") {
			docType = "po"
		} else if strings.HasPrefix(strings.ToUpper(number), "INV") {
			docType = "invoice"
		} else if strings.HasPrefix(strings.ToUpper(number), "SHP") {
			docType = "shipment"
		} else {
			docType = "order"
		}
	}

	data := map[string]interface{}{
		"number":           number,
		"product_name":     product,
		"quantity":         qty,
		"unit_price_minor": priceMinor,
		"status":           status,
	}

	return &domain.ExtractedFact{
		FactType:   docType,
		Identifier: number,
		EntityName: entityName,
		EntityType: p.guessEntityType(docType),
		Data:       data,
		Location:   "row " + strconv.Itoa(lineNum),
		Timestamp:  &now,
		Confidence: 0.96,
	}
}

func (p *CSVParser) guessEntityType(docType string) string {
	switch strings.ToLower(docType) {
	case "po", "purchase_order":
		return string(domain.EntityTypeSupplier)
	default:
		return string(domain.EntityTypeCustomer)
	}
}
