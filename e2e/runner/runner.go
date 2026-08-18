package runner

import (
	"fmt"
	"strings"
	"time"
)

// Registry holds all registered test cases.
var Registry = make([]TestCase, 0)

// Register adds a test case to the test registry.
func Register(tc TestCase) {
	Registry = append(Registry, tc)
}

// Run executes registered test cases matching the optional tier filter.
func Run(baseURL string, tierFilter string) *SuiteReport {
	startTime := time.Now()
	report := &SuiteReport{
		TierSummaries: make(map[TestTier]*TierSummary),
		Results:       make([]TestResult, 0),
	}

	tiers := []TestTier{Tier1, Tier2, Tier3, Tier4}
	for _, t := range tiers {
		report.TierSummaries[t] = &TierSummary{Tier: t}
	}

	fmt.Println("================================================================================")
	fmt.Println("             MISTAKE PLATFORM: 4-TIER E2E VERIFICATION SUITE                    ")
	fmt.Printf(" Base URL: %s | Total Tests Registered: %d\n", baseURL, len(Registry))
	fmt.Println("================================================================================")

	for _, tc := range Registry {
		if tierFilter != "" && !strings.Contains(strings.ToLower(string(tc.Tier)), strings.ToLower(tierFilter)) {
			continue
		}

		t0 := time.Now()
		err := tc.Fn(baseURL)
		dur := time.Since(t0)

		res := TestResult{
			Name:     tc.Name,
			Tier:     tc.Tier,
			Feature:  tc.Feature,
			Passed:   err == nil,
			Duration: dur,
		}
		if err != nil {
			res.ErrorMessage = err.Error()
		}

		report.Total++
		report.Results = append(report.Results, res)
		summary := report.TierSummaries[tc.Tier]
		summary.Total++
		summary.Duration += dur

		if res.Passed {
			report.Passed++
			summary.Passed++
			fmt.Printf(" [PASS] [%s] %s (%v)\n", tc.Tier, tc.Name, dur.Round(time.Millisecond))
		} else {
			report.Failed++
			summary.Failed++
			fmt.Printf(" [FAIL] [%s] %s: %s (%v)\n", tc.Tier, tc.Name, res.ErrorMessage, dur.Round(time.Millisecond))
		}
	}

	report.Duration = time.Since(startTime)
	printSummary(report)
	return report
}

func printSummary(r *SuiteReport) {
	fmt.Println("\n================================================================================")
	fmt.Println("                           E2E TEST SUITE SUMMARY                               ")
	fmt.Println("================================================================================")
	tiers := []TestTier{Tier1, Tier2, Tier3, Tier4}
	for _, t := range tiers {
		s := r.TierSummaries[t]
		status := "PASS"
		if s.Failed > 0 {
			status = "FAIL"
		}
		fmt.Printf(" %-40s | Total: %3d | Passed: %3d | Failed: %3d | %s\n",
			t, s.Total, s.Passed, s.Failed, status)
	}
	fmt.Println("--------------------------------------------------------------------------------")
	overall := "ALL TESTS PASSED"
	if r.Failed > 0 {
		overall = fmt.Sprintf("%d TESTS FAILED", r.Failed)
	}
	fmt.Printf(" Total Tests: %d | Passed: %d | Failed: %d | Time: %v | Result: %s\n",
		r.Total, r.Passed, r.Failed, r.Duration.Round(time.Millisecond), overall)
	fmt.Println("================================================================================")
}
