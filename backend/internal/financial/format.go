package financial

import (
	"fmt"
	"strconv"
	"strings"
)

// FormatPaise formats paise into Indian Rupee format (e.g., ₹ 1,50,000.00).
func FormatPaise(paise int64) string {
	negative := paise < 0
	absPaise := Abs(paise)

	rupees := absPaise / 100
	remainder := absPaise % 100

	formattedRupees := formatIndianNumber(rupees)
	res := fmt.Sprintf("₹ %s.%02d", formattedRupees, remainder)
	if negative {
		return "-" + res
	}
	return res
}

// FormatPaiseShort formats paise into compact Indian format (e.g., ₹1.5 L, ₹2.3 Cr, ₹50 K).
func FormatPaiseShort(paise int64) string {
	if paise == 0 {
		return "₹0"
	}
	negative := paise < 0
	absPaise := Abs(paise)
	rupees := float64(absPaise) / 100.0

	var s string
	if rupees >= 10000000 { // 1 Crore
		val := rupees / 10000000.0
		s = fmt.Sprintf("₹%s Cr", strconv.FormatFloat(val, 'f', -1, 64))
	} else if rupees >= 100000 { // 1 Lakh
		val := rupees / 100000.0
		s = fmt.Sprintf("₹%s L", strconv.FormatFloat(val, 'f', -1, 64))
	} else if rupees >= 1000 { // 1 Thousand
		val := rupees / 1000.0
		s = fmt.Sprintf("₹%s K", strconv.FormatFloat(val, 'f', -1, 64))
	} else {
		s = fmt.Sprintf("₹%s", strconv.FormatFloat(rupees, 'f', -1, 64))
	}

	if negative {
		return "-" + s
	}
	return s
}

// formatIndianNumber formats an integer according to the Indian grouping convention (2,2,3).
func formatIndianNumber(n int64) string {
	s := strconv.FormatInt(n, 10)
	if len(s) <= 3 {
		return s
	}

	// Last 3 digits
	last3 := s[len(s)-3:]
	remaining := s[:len(s)-3]

	var parts []string
	for len(remaining) > 2 {
		parts = append([]string{remaining[len(remaining)-2:]}, parts...)
		remaining = remaining[:len(remaining)-2]
	}
	if len(remaining) > 0 {
		parts = append([]string{remaining}, parts...)
	}

	return strings.Join(parts, ",") + "," + last3
}
