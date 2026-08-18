package pipeline

import (
	"bufio"
	"io"
	"mistake-backend/internal/domain"
	"net/mail"
	"strings"
	"time"
)

type EmailParser struct{}

func NewEmailParser() *EmailParser {
	return &EmailParser{}
}

func (p *EmailParser) Parse(r io.Reader) ([]*domain.ExtractedFact, error) {
	msg, err := mail.ReadMessage(r)
	var bodyText string
	var subject string
	var from string

	if err == nil {
		subject = msg.Header.Get("Subject")
		from = msg.Header.Get("From")
		buf := new(strings.Builder)
		_, _ = io.Copy(buf, msg.Body)
		bodyText = buf.String()
	} else {
		// Fallback simple line reader
		scanner := bufio.NewScanner(r)
		var b strings.Builder
		for scanner.Scan() {
			b.WriteString(scanner.Text() + "\n")
		}
		bodyText = b.String()
		subject = "Purchase Order Notification"
		from = "supplier@example.com"
	}

	now := time.Now().UTC()
	docType := "po"
	if strings.Contains(strings.ToLower(subject), "invoice") || strings.Contains(strings.ToLower(bodyText), "invoice") {
		docType = "invoice"
	}

	fact := &domain.ExtractedFact{
		FactType:   docType,
		Identifier: "EML-" + time.Now().Format("150405"),
		EntityName: from,
		EntityType: string(domain.EntityTypeSupplier),
		Data: map[string]interface{}{
			"subject": subject,
			"from":    from,
			"snippet": bodyText,
		},
		Location:   "email header/body",
		Timestamp:  &now,
		Confidence: 0.88,
	}

	return []*domain.ExtractedFact{fact}, nil
}
