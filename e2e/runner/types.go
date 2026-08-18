package runner

import "time"

// TestTier identifies the level in the 4-Tier test methodology.
type TestTier string

const (
	Tier1 TestTier = "Tier 1 (Feature Coverage)"
	Tier2 TestTier = "Tier 2 (Boundary & Corner Cases)"
	Tier3 TestTier = "Tier 3 (Cross-Feature Pairwise)"
	Tier4 TestTier = "Tier 4 (Real-World Industrial Scenarios)"
)

// TestCase represents an individual executable E2E test.
type TestCase struct {
	Name        string
	Tier        TestTier
	Feature     string
	Description string
	Fn          func(baseURL string) error
}

// TestResult stores the outcome of executing a test case.
type TestResult struct {
	Name         string
	Tier         TestTier
	Feature      string
	Passed       bool
	Duration     time.Duration
	ErrorMessage string
}

// TierSummary aggregates results for a single tier.
type TierSummary struct {
	Tier     TestTier
	Total    int
	Passed   int
	Failed   int
	Duration time.Duration
}

// SuiteReport contains aggregated results across all tiers.
type SuiteReport struct {
	Total         int
	Passed        int
	Failed        int
	Duration      time.Duration
	TierSummaries map[TestTier]*TierSummary
	Results       []TestResult
}
