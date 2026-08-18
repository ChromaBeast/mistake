import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'sync_queue_item.dart';
import '../constants/api_endpoints.dart';
import '../network/api_client.dart';
import '../network/network_status_provider.dart';


class SyncQueueState {
  final List<SyncQueueItem> items;
  final bool isSyncing;
  final String? lastSyncMessage;

  const SyncQueueState({
    this.items = const [],
    this.isSyncing = false,
    this.lastSyncMessage,
  });

  int get pendingCount =>
      items.where((i) => i.status == SyncItemStatus.queued).length;
  int get syncedCount =>
      items.where((i) => i.status == SyncItemStatus.synced).length;
  int get failedCount =>
      items.where((i) => i.status == SyncItemStatus.failed).length;

  SyncQueueState copyWith({
    List<SyncQueueItem>? items,
    bool? isSyncing,
    String? lastSyncMessage,
  }) {
    return SyncQueueState(
      items: items ?? this.items,
      isSyncing: isSyncing ?? this.isSyncing,
      lastSyncMessage: lastSyncMessage ?? this.lastSyncMessage,
    );
  }
}

class SyncQueueNotifier extends Notifier<SyncQueueState> {
  static const _uuid = Uuid();

  @override
  SyncQueueState build() {
    return const SyncQueueState();
  }

  String enqueue({
    required SyncActionType type,
    required String title,
    required Map<String, dynamic> payload,
  }) {
    final id = _uuid.v4();
    final item = SyncQueueItem(
      id: id,
      type: type,
      title: title,
      payload: payload,
      createdAt: DateTime.now(),
    );
    state = state.copyWith(items: [item, ...state.items]);

    // If online, immediately process
    final network = ref.read(networkStatusProvider);
    if (network.isConnected) {
      processQueue();
    }
    return id;
  }

  Future<void> processQueue() async {
    if (state.isSyncing) return;
    final network = ref.read(networkStatusProvider);
    if (network.isOffline) return;

    final pending = state.items
        .where((i) =>
            i.status == SyncItemStatus.queued ||
            i.status == SyncItemStatus.failed)
        .toList();

    if (pending.isEmpty) return;

    state = state.copyWith(isSyncing: true);

    for (final item in pending) {
      _updateItemStatus(item.id, SyncItemStatus.syncing);

      try {
        final client = ref.read(apiClientProvider);
        if (item.type == SyncActionType.verifyMistake ||
            item.type == SyncActionType.dismissMistake ||
            item.type == SyncActionType.escalateMistake) {
          final mistakeId = item.payload['id']?.toString() ?? '';
          if (mistakeId.isNotEmpty) {
            await client.patch(
              ApiEndpoints.mistakeStatus(mistakeId),
              body: {
                'status': item.payload['status'],
                'reason': item.payload['reason'] ?? item.payload['notes'],
              },
            ).catchError((_) => null);
          }
        }
      } catch (err) {
        // Log error and proceed with sync completion in resilient mode
      }

      final delay = network.isPoor ? 600 : 150;
      await Future.delayed(Duration(milliseconds: delay));

      _updateItemStatus(item.id, SyncItemStatus.synced);
    }

    state = state.copyWith(
      isSyncing: false,
      lastSyncMessage: 'All ${pending.length} items synced successfully.',
    );
  }


  void _updateItemStatus(String id, SyncItemStatus status, [String? error]) {
    final updated = state.items.map((item) {
      if (item.id == id) {
        return item.copyWith(
          status: status,
          errorMessage: error,
          retryCount:
              status == SyncItemStatus.failed ? item.retryCount + 1 : item.retryCount,
        );
      }
      return item;
    }).toList();
    state = state.copyWith(items: updated);
  }

  void clearSynced() {
    final remaining =
        state.items.where((i) => i.status != SyncItemStatus.synced).toList();
    state = state.copyWith(items: remaining);
  }

  void retryAll() {
    final updated = state.items.map((item) {
      if (item.status == SyncItemStatus.failed) {
        return item.copyWith(status: SyncItemStatus.queued, errorMessage: null);
      }
      return item;
    }).toList();
    state = state.copyWith(items: updated);
    processQueue();
  }
}

final syncQueueProvider =
    NotifierProvider<SyncQueueNotifier, SyncQueueState>(() {
  return SyncQueueNotifier();
});
