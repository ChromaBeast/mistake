package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"mistake-backend/internal/pipeline"
)

func main() {
	fmt.Println("=== Mistake Ingestion Queue Load Test ===")
	queue := pipeline.NewMemoryQueue()
	defer queue.Close()

	const totalJobs = 500
	const concurrentWorkers = 10

	var processedCount int64
	var mu sync.Mutex
	doneChan := make(chan struct{})

	start := time.Now()

	_ = queue.Subscribe(context.Background(), "ingestion.jobs", func(ctx context.Context, payload []byte) error {
		mu.Lock()
		processedCount++
		current := processedCount
		mu.Unlock()

		if current == totalJobs {
			close(doneChan)
		}
		return nil
	})

	var wg sync.WaitGroup
	jobsPerWorker := totalJobs / concurrentWorkers

	for w := 0; w < concurrentWorkers; w++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for j := 0; j < jobsPerWorker; j++ {
				payload := []byte(fmt.Sprintf(`{"tenant_id":"t1","doc_id":"doc-%d-%d"}`, workerID, j))
				_ = queue.Publish(context.Background(), "ingestion.jobs", payload)
			}
		}(w)
	}

	wg.Wait()

	select {
	case <-doneChan:
		elapsed := time.Since(start)
		rate := float64(totalJobs) / elapsed.Seconds()
		fmt.Printf("Successfully processed %d jobs in %v (%.2f jobs/sec)\n", totalJobs, elapsed, rate)
		fmt.Println("Result: In-memory queue copes with pilot volume without Kafka bottleneck.")
	case <-time.After(10 * time.Second):
		fmt.Println("Load test timed out!")
	}
}
