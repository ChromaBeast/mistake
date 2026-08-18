package pipeline

import (
	"regexp"
	"strings"
)

// SanitizationResult captures the outcome of scanning untrusted document text.
type SanitizationResult struct {
	SanitizedText   string
	IsSuspicious    bool
	DetectedThreats []string
}

var injectionPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)ignore\s+(all\s+)?(previous|prior|above)\s+instructions`),
	regexp.MustCompile(`(?i)system\s+(prompt|override|command|directive)`),
	regexp.MustCompile(`(?i)output\s+the\s+system\s+(prompt|message|instructions)`),
	regexp.MustCompile(`(?i)you\s+are\s+now\s+(in|a)\s+(maintenance|developer|god)\s+mode`),
	regexp.MustCompile(`(?i)disregard\s+all\s+(rules|guidelines|safety)`),
	regexp.MustCompile(`(?i)exfiltrate|leak\s+tenant\s+data`),
	regexp.MustCompile(`(?i)\[SYSTEM\]|\[ADMIN\]|<\|im_start\|>|<\|im_end\|>`),
	regexp.MustCompile(`(?i)!\[.*?\]\(https?://[^\s)]+\)`), // Markdown image data exfiltration
}

// SanitizeExtractedText scans untrusted document content for prompt injection attacks.
func SanitizeExtractedText(rawText string) SanitizationResult {
	result := SanitizationResult{
		SanitizedText:   rawText,
		IsSuspicious:    false,
		DetectedThreats: []string{},
	}

	sanitized := rawText
	for _, pattern := range injectionPatterns {
		matches := pattern.FindAllString(rawText, -1)
		if len(matches) > 0 {
			result.IsSuspicious = true
			for _, m := range matches {
				result.DetectedThreats = append(result.DetectedThreats, strings.TrimSpace(m))
			}
			// Redact malicious phrases before sending to LLM context
			sanitized = pattern.ReplaceAllString(sanitized, "[REDACTED_UNTRUSTED_DIRECTIVE]")
		}
	}

	result.SanitizedText = sanitized
	return result
}
