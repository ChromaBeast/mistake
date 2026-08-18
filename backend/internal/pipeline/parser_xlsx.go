package pipeline

import (
	"bytes"
	"io"
	"mistake-backend/internal/domain"
)

// XLSXParser handles workbook formats and spreadsheet exports.
type XLSXParser struct {
	csvParser *CSVParser
}

func NewXLSXParser() *XLSXParser {
	return &XLSXParser{csvParser: NewCSVParser()}
}

// Parse extracts facts from tabular spreadsheet streams.
func (p *XLSXParser) Parse(r io.Reader) ([]*domain.ExtractedFact, error) {
	buf := new(bytes.Buffer)
	if _, err := buf.ReadFrom(r); err != nil {
		return nil, err
	}

	// In the lightweight engine, spreadsheet streams are processed tab/comma delimited
	return p.csvParser.Parse(bytes.NewReader(buf.Bytes()), 0)
}
