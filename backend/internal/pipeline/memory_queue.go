package pipeline

import (
	"context"
	"sync"
)

type MemoryQueue struct {
	mu          sync.RWMutex
	subscribers map[string][]func(ctx context.Context, payload []byte) error
}

func NewMemoryQueue() *MemoryQueue {
	return &MemoryQueue{
		subscribers: make(map[string][]func(ctx context.Context, payload []byte) error),
	}
}

func (q *MemoryQueue) Publish(ctx context.Context, topic string, payload []byte) error {
	q.mu.RLock()
	handlers, ok := q.subscribers[topic]
	q.mu.RUnlock()

	if !ok {
		return nil
	}

	for _, handler := range handlers {
		go func(h func(ctx context.Context, payload []byte) error) {
			_ = h(ctx, payload)
		}(handler)
	}
	return nil
}

func (q *MemoryQueue) Subscribe(ctx context.Context, topic string, handler func(ctx context.Context, payload []byte) error) error {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.subscribers[topic] = append(q.subscribers[topic], handler)
	return nil
}

func (q *MemoryQueue) Close() error {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.subscribers = make(map[string][]func(ctx context.Context, payload []byte) error)
	return nil
}
