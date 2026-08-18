enum NotificationSeverity {
  critical,
  warning,
  info,
}

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final NotificationSeverity severity;
  final String? mistakeId;
  final DateTime timestamp;
  final bool isRead;
  final String? actionUrl;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.severity,
    this.mistakeId,
    required this.timestamp,
    this.isRead = false,
    this.actionUrl,
  });

  NotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    NotificationSeverity? severity,
    String? mistakeId,
    DateTime? timestamp,
    bool? isRead,
    String? actionUrl,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      severity: severity ?? this.severity,
      mistakeId: mistakeId ?? this.mistakeId,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      actionUrl: actionUrl ?? this.actionUrl,
    );
  }
}
