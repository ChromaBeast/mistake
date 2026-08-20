package pipeline

import "context"

// QueuePublisher provides an abstract message publishing contract for ingestion jobs.
type QueuePublisher interface {
	Publish(ctx context.Context, topic string, payload []byte) error
}

// QueueConsumer provides an abstract message consumption contract.
type QueueConsumer interface {
	Subscribe(ctx context.Context, topic string, handler func(ctx context.Context, payload []byte) error) error
	Close() error
}
