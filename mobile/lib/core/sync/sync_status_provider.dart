import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'sync_queue_notifier.dart';
import '../network/network_status_provider.dart';

class SyncSummary {
  final int pendingCount;
  final int syncedCount;
  final int failedCount;
  final bool isSyncing;
  final NetworkStatus networkStatus;

  const SyncSummary({
    required this.pendingCount,
    required this.syncedCount,
    required this.failedCount,
    required this.isSyncing,
    required this.networkStatus,
  });

  bool get isFullySynced => pendingCount == 0 && failedCount == 0;
  bool get hasErrors => failedCount > 0;
}

final syncSummaryProvider = Provider<SyncSummary>((ref) {
  final syncState = ref.watch(syncQueueProvider);
  final network = ref.watch(networkStatusProvider);

  return SyncSummary(
    pendingCount: syncState.pendingCount,
    syncedCount: syncState.syncedCount,
    failedCount: syncState.failedCount,
    isSyncing: syncState.isSyncing,
    networkStatus: network,
  );
});
