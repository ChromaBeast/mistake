package pipeline

import (
	"context"
	"sync"
)

type Job struct {
	TenantID     string
	DataSourceID string
	FileContent  []byte
}

type WorkerPool struct {
	pipeline    *Pipeline
	jobChan     chan Job
	workerCount int
	wg          sync.WaitGroup
	ctx         context.Context
	cancel      context.CancelFunc
}

func NewWorkerPool(pipeline *Pipeline, workerCount, bufferSize int) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	return &WorkerPool{
		pipeline:    pipeline,
		jobChan:     make(chan Job, bufferSize),
		workerCount: workerCount,
		ctx:         ctx,
		cancel:      cancel,
	}
}

func (wp *WorkerPool) Start() {
	for i := 0; i < wp.workerCount; i++ {
		wp.wg.Add(1)
		go wp.worker()
	}
}

func (wp *WorkerPool) Enqueue(tenantID, dataSourceID string, fileContent []byte) {
	wp.jobChan <- Job{
		TenantID:     tenantID,
		DataSourceID: dataSourceID,
		FileContent:  fileContent,
	}
}

func (wp *WorkerPool) Stop() {
	wp.cancel()
	close(wp.jobChan)
	wp.wg.Wait()
}

func (wp *WorkerPool) worker() {
	defer wp.wg.Done()
	for {
		select {
		case <-wp.ctx.Done():
			return
		case job, ok := <-wp.jobChan:
			if !ok {
				return
			}
			ctx := context.WithValue(context.Background(), "tenant_id", job.TenantID)
			_ = wp.pipeline.ProcessDataSource(ctx, job.TenantID, job.DataSourceID, job.FileContent)
		}
	}
}
