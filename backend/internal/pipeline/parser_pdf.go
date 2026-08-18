package pipeline

import (
	"bufio"
	"io"
	"mistake-backend/internal/domain"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var (
	invRegex   = regexp.MustCompile(`(?i)(?:invoice|inv)[\s#:]*([A-Za-z0-9\-]+)`)
	poRegex    = regexp.MustCompile(`(?i)(?:po|purchase\s*order)[\s#:]*([A-Za-z0-9\-]+)`)
	totalRegex = regexp.MustCompile(`(?i)(?:total|amount|grand\s*total)[\s:₹Rs\.]*([\d,]+\.?\d*)`)
	vendorRegex = regexp.MustCompile(`(?i)(?:supplier|vendor|from|billed\s*by)[\s:]*([A-Za-z0-9\s\.\,]+)`)
)

type PDFParser struct{}

func NewPDFParser() *PDFParser {
	return &PDFParser{}
}

func (p *PDFParser) Parse(r io.Reader) ([]*domain.ExtractedFact, error) {
	scanner := bufio.NewScanner(r)
	var fullText strings.Builder
	lineCount := 0

	for scanner.Scan() {
		line := scanner.Text()
		fullText.WriteString(line + "\n")
		lineCount++
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}

	text := fullText.String()
	now := time.Now().UTC()

	var docType string = "invoice"
	var identifier string = "INV-AUTO"
	var entityName string = "Vendor Corp"
	var totalAmountMinor int64 = 0

	if m := invRegex.FindStringSubmatch(text); len(m) > 1 {
		identifier = strings.TrimSpace(m[1])
		docType = "invoice"
	} else if m := poRegex.FindStringSubmatch(text); len(m) > 1 {
		identifier = strings.TrimSpace(m[1])
		docType = "po"
	}

	if m := vendorRegex.FindStringSubmatch(text); len(m) > 1 {
		entityName = strings.TrimSpace(m[1])
	}

	if m := totalRegex.FindStringSubmatch(text); len(m) > 1 {
		cleaned := strings.ReplaceAll(m[1], ",", "")
		if val, err := strconv.ParseFloat(cleaned, 64); err == nil {
			totalAmountMinor = int64(val * 100)
		}
	}

	fact := &domain.ExtractedFact{
		FactType:   docType,
		Identifier: identifier,
		EntityName: entityName,
		EntityType: string(domain.EntityTypeSupplier),
		Data: map[string]interface{}{
			"number":           identifier,
			"total_amount_minor": totalAmountMinor,
			"raw_text_length":  len(text),
		},
		Location:   "page 1",
		Timestamp:  &now,
		Confidence: 0.92,
	}

	return []*domain.ExtractedFact{fact}, nil
}
