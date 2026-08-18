import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../../models/notification_item.dart';

class NotificationState {
  final List<NotificationItem> items;
  final NotificationItem? activePushToast;

  const NotificationState({
    this.items = const [],
    this.activePushToast,
  });

  int get unreadCount => items.where((n) => !n.isRead).length;

  NotificationState copyWith({
    List<NotificationItem>? items,
    NotificationItem? activePushToast,
    bool clearToast = false,
  }) {
    return NotificationState(
      items: items ?? this.items,
      activePushToast: clearToast ? null : (activePushToast ?? this.activePushToast),
    );
  }
}

class NotificationNotifier extends Notifier<NotificationState> {
  static const _uuid = Uuid();

  @override
  NotificationState build() {
    return NotificationState(
      items: [
        NotificationItem(
          id: 'notif-1',
          title: 'CRITICAL: ₹47,500 Quantity Variance',
          message: 'Tata Steel Tubes delivery short by 500 units against PO-4091.',
          severity: NotificationSeverity.critical,
          mistakeId: 'mst-001',
          timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
        ),
        NotificationItem(
          id: 'notif-2',
          title: 'Contract Pricing Breach Flagged',
          message: 'Hindalco aluminum ingot rate exceeds master rate by ₹35/kg.',
          severity: NotificationSeverity.warning,
          mistakeId: 'mst-002',
          timestamp: DateTime.now().subtract(const Duration(hours: 1)),
        ),
        NotificationItem(
          id: 'notif-3',
          title: 'Document Ingestion Complete',
          message: 'Batch #B-9912 (8 pages) extracted and indexed successfully.',
          severity: NotificationSeverity.info,
          timestamp: DateTime.now().subtract(const Duration(hours: 3)),
          isRead: true,
        ),
      ],
    );
  }

  void markAsRead(String id) {
    final updated = state.items.map((item) {
      if (item.id == id) {
        return item.copyWith(isRead: true);
      }
      return item;
    }).toList();
    state = state.copyWith(items: updated);
  }

  void markAllAsRead() {
    final updated = state.items.map((item) => item.copyWith(isRead: true)).toList();
    state = state.copyWith(items: updated);
  }

  void simulateHighValueAlert() {
    final newNotif = NotificationItem(
      id: _uuid.v4(),
      title: '🚨 CRITICAL: ₹1,20,000 Price Leakage',
      message: 'Copper Rod shipment invoice unit price ₹780.00/kg vs contracted ₹660.00/kg.',
      severity: NotificationSeverity.critical,
      mistakeId: 'mst-triage-2',
      timestamp: DateTime.now(),
    );

    state = state.copyWith(
      items: [newNotif, ...state.items],
      activePushToast: newNotif,
    );
  }

  void dismissToast() {
    state = state.copyWith(clearToast: true);
  }
}

final notificationProvider =
    NotifierProvider<NotificationNotifier, NotificationState>(() {
  return NotificationNotifier();
});
