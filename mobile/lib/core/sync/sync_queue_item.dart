enum SyncActionType {
  uploadDocument,
  verifyMistake,
  dismissMistake,
  escalateMistake,
  flagInspection,
  acceptInspection,
}

enum SyncItemStatus {
  queued,
  syncing,
  synced,
  failed,
}

class SyncQueueItem {
  final String id;
  final SyncActionType type;
  final String title;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final SyncItemStatus status;
  final String? errorMessage;
  final int retryCount;

  const SyncQueueItem({
    required this.id,
    required this.type,
    required this.title,
    required this.payload,
    required this.createdAt,
    this.status = SyncItemStatus.queued,
    this.errorMessage,
    this.retryCount = 0,
  });

  SyncQueueItem copyWith({
    String? id,
    SyncActionType? type,
    String? title,
    Map<String, dynamic>? payload,
    DateTime? createdAt,
    SyncItemStatus? status,
    String? errorMessage,
    int? retryCount,
  }) {
    return SyncQueueItem(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      payload: payload ?? this.payload,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      retryCount: retryCount ?? this.retryCount,
    );
  }
}
