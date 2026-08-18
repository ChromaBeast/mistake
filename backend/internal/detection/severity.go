package detection

import (
	"mistake-backend/internal/domain"
)

// Paise thresholds
const (
	PaiseThresholdCritical = 10000000 // ₹1,00,000
	PaiseThresholdHigh     = 2500000  // ₹25,000
	PaiseThresholdMedium   = 500000   // ₹5,000
)

// Delay days thresholds
const (
	DelayDaysHigh   = 14
	DelayDaysMedium = 3
)

// CalculateSeverity returns a deterministic severity level according to the rubric.
func CalculateSeverity(impactMinor int64, delayDays int) domain.Severity {
	if impactMinor >= PaiseThresholdCritical {
		return domain.SeverityCritical
	}
	if impactMinor >= PaiseThresholdHigh || delayDays >= DelayDaysHigh {
		return domain.SeverityHigh
	}
	if impactMinor >= PaiseThresholdMedium || delayDays >= DelayDaysMedium {
		return domain.SeverityMedium
	}
	if impactMinor > 0 || delayDays > 0 {
		return domain.SeverityLow
	}
	return domain.SeverityHealthy
}
