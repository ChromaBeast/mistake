import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/network/network_status_provider.dart';
import 'package:mobile/core/sync/sync_queue_item.dart';
import 'package:mobile/core/sync/sync_queue_notifier.dart';

void main() {
  group('SyncQueueNotifier', () {
    test('enqueues items and updates pending count', () {
      final container = ProviderContainer(
        overrides: [
          networkStatusProvider.overrideWith(
            (ref) => NetworkStatusNotifier()..setStatus(NetworkStatus.offline),
          ),
        ],
      );

      final notifier = container.read(syncQueueProvider.notifier);
      final id1 = notifier.enqueue(
        type: SyncActionType.verifyMistake,
        title: 'Verify Leak 001',
        payload: {'id': 'mst-001'},
      );

      final state = container.read(syncQueueProvider);
      expect(state.items.length, equals(1));
      expect(state.pendingCount, equals(1));
      expect(state.items.first.id, equals(id1));
      expect(state.items.first.status, equals(SyncItemStatus.queued));
    });

    test('replays pending items when network becomes online', () async {
      final container = ProviderContainer(
        overrides: [
          networkStatusProvider.overrideWith(
            (ref) => NetworkStatusNotifier()..setStatus(NetworkStatus.offline),
          ),
        ],
      );

      final notifier = container.read(syncQueueProvider.notifier);
      notifier.enqueue(
        type: SyncActionType.flagInspection,
        title: 'Flagged Shortage',
        payload: {'barcode': 'EWAY-123'},
      );

      expect(container.read(syncQueueProvider).pendingCount, equals(1));

      // Switch to online and trigger processQueue
      container.read(networkStatusProvider.notifier).setStatus(NetworkStatus.online);
      await notifier.processQueue();

      final state = container.read(syncQueueProvider);
      expect(state.syncedCount, equals(1));
      expect(state.pendingCount, equals(0));
      expect(state.items.first.status, equals(SyncItemStatus.synced));
    });

    test('clears synced items from state', () async {
      final container = ProviderContainer(
        overrides: [
          networkStatusProvider.overrideWith(
            (ref) => NetworkStatusNotifier()..setStatus(NetworkStatus.offline),
          ),
        ],
      );

      final notifier = container.read(syncQueueProvider.notifier);
      notifier.enqueue(
        type: SyncActionType.acceptInspection,
        title: 'Accepted Goods',
        payload: {'barcode': 'PO-4091'},
      );

      container.read(networkStatusProvider.notifier).setStatus(NetworkStatus.online);
      await notifier.processQueue();
      expect(container.read(syncQueueProvider).syncedCount, equals(1));

      notifier.clearSynced();
      expect(container.read(syncQueueProvider).items.length, equals(0));
    });
  });
}
