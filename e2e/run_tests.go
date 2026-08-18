package main

import (
	"flag"
	"fmt"
	"os"

	"mistake-e2e/runner"

	_ "mistake-e2e/tier1_features"
	_ "mistake-e2e/tier2_boundaries"
	_ "mistake-e2e/tier3_pairwise"
	_ "mistake-e2e/tier4_realworld"
)

func main() {
	defaultURL := os.Getenv("TEST_API_URL")
	if defaultURL == "" {
		defaultURL = "http://localhost:8080"
	}

	baseURLFlag := flag.String("url", defaultURL, "Base URL for the Mistake API server")
	tierFlag := flag.String("tier", "", "Filter tests by tier (e.g., 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4')")
	flag.Parse()

	report := runner.Run(*baseURLFlag, *tierFlag)

	if report.Failed > 0 {
		fmt.Printf("\n[FAILURE] %d tests failed during E2E verification run.\n", report.Failed)
		os.Exit(1)
	}

	fmt.Println("\n[SUCCESS] All E2E test suites passed successfully!")
	os.Exit(0)
}
