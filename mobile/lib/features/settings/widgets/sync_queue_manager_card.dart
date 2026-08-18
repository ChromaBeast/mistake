import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/network/network_status_provider.dart';
import '../../../../core/sync/sync_queue_notifier.dart';
import '../../../../shared/components/app_button.dart';
import '../../../../shared/components/app_card.dart';

class SyncQueueManagerCard extends ConsumerWidget {
  const SyncQueueManagerCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final network = ref.watch(networkStatusProvider);
    final syncState = ref.watch(syncQueueProvider);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${syncState.pendingCount} Pending • ${syncState.syncedCount} Synced',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white),
              ),
              if (syncState.isSyncing)
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: AppDimensions.p12),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Force Sync Now',
                  variant: ButtonVariant.primary,
                  height: AppDimensions.buttonHeightSm,
                  onPressed: network.isConnected && syncState.pendingCount > 0
                      ? () => ref.read(syncQueueProvider.notifier).processQueue()
                      : null,
                ),
              ),
              const SizedBox(width: AppDimensions.p8),
              Expanded(
                child: AppButton(
                  label: 'Clear Synced',
                  variant: ButtonVariant.secondary,
                  height: AppDimensions.buttonHeightSm,
                  onPressed: syncState.syncedCount > 0
                      ? () => ref.read(syncQueueProvider.notifier).clearSynced()
                      : null,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
