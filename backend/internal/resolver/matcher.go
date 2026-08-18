package resolver

import (
	"regexp"
	"strings"
)

var suffixRegex = regexp.MustCompile(`(?i)\b(pvt\.?\s*ltd\.?|private\s+limited|limited|ltd\.?|llp|corp\.?|corporation|inc\.?|co\.?|enterprises|traders|industries|agencies)\b`)
var nonAlphaNumeric = regexp.MustCompile(`[^a-zA-Z0-9\s]`)

// NormalizeEntityName normalizes an entity name by trimming, case folding,
// stripping punctuation and common company suffixes.
func NormalizeEntityName(name string) string {
	s := strings.ToLower(name)
	s = suffixRegex.ReplaceAllString(s, "")
	s = nonAlphaNumeric.ReplaceAllString(s, " ")
	s = strings.Join(strings.Fields(s), " ")
	return strings.TrimSpace(s)
}

// LevenshteinDistance calculates the Levenshtein distance between two strings.
func LevenshteinDistance(s1, s2 string) int {
	r1, r2 := []rune(s1), []rune(s2)
	n, m := len(r1), len(r2)
	if n == 0 {
		return m
	}
	if m == 0 {
		return n
	}

	dp := make([][]int, n+1)
	for i := range dp {
		dp[i] = make([]int, m+1)
		dp[i][0] = i
	}
	for j := 0; j <= m; j++ {
		dp[0][j] = j
	}

	for i := 1; i <= n; i++ {
		for j := 1; j <= m; j++ {
			cost := 0
			if r1[i-1] != r2[j-1] {
				cost = 1
			}
			minVal := dp[i-1][j] + 1 // deletion
			if dp[i][j-1]+1 < minVal {
				minVal = dp[i][j-1] + 1 // insertion
			}
			if dp[i-1][j-1]+cost < minVal {
				minVal = dp[i-1][j-1] + cost // substitution
			}
			dp[i][j] = minVal
		}
	}
	return dp[n][m]
}

// CalculateSimilarity returns a normalized similarity score between 0.000 and 1.000.
func CalculateSimilarity(name1, name2 string) float64 {
	n1 := NormalizeEntityName(name1)
	n2 := NormalizeEntityName(name2)
	if n1 == "" && n2 == "" {
		return 1.0
	}
	if n1 == "" || n2 == "" {
		return 0.0
	}
	if n1 == n2 {
		return 1.0
	}

	dist := LevenshteinDistance(n1, n2)
	maxLen := len([]rune(n1))
	if len([]rune(n2)) > maxLen {
		maxLen = len([]rune(n2))
	}
	if maxLen == 0 {
		return 1.0
	}

	score := 1.0 - (float64(dist) / float64(maxLen))
	if score < 0.0 {
		return 0.0
	}
	return score
}
