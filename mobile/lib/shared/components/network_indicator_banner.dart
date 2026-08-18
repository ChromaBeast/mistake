import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/network/network_status_provider.dart';
import '../../core/sync/sync_queue_notifier.dart';
import '../../core/sync/sync_status_provider.dart';

class NetworkIndicatorBanner extends ConsumerWidget {
  const NetworkIndicatorBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = ref.watch(syncSummaryProvider);

    if (summary.networkStatus.isConnected && summary.pendingCount == 0 && !summary.isSyncing) {
      return const SizedBox.shrink();
    }

    Color bgColor;
    Color fgColor;
    IconData icon;
    String text;

    if (summary.networkStatus.isOffline) {
      bgColor = AppColors.warningBg;
      fgColor = AppColors.warning;
      icon = Icons.cloud_off_rounded;
      text = 'Offline Mode • ${summary.pendingCount} action(s) queued locally';
    } else if (summary.isSyncing) {
      bgColor = AppColors.primary.withValues(alpha: 0.2);
      fgColor = AppColors.primaryLight;
      icon = Icons.sync_rounded;
      text = 'Syncing ${summary.pendingCount} offline item(s)...';
    } else if (summary.networkStatus.isPoor) {
      bgColor = AppColors.surfaceElevated;
      fgColor = AppColors.warning;
      icon = Icons.network_check_rounded;
      text = 'Poor Connection (2G) • Sync may be delayed';
    } else {
      bgColor = AppColors.primary.withValues(alpha: 0.15);
      fgColor = AppColors.primary;
      icon = Icons.cloud_upload_outlined;
      text = '${summary.pendingCount} pending item(s) to sync';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p16,
        vertical: AppDimensions.p8,
      ),
      color: bgColor,
      child: Row(
        children: [
          Icon(icon, size: 16, color: fgColor),
          const SizedBox(width: AppDimensions.p8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: fgColor,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (summary.networkStatus.isConnected && summary.pendingCount > 0 && !summary.isSyncing)
            GestureDetector(
              onTap: () => ref.read(syncQueueProvider.notifier).processQueue(),
              child: Padding(
                padding: const EdgeInsets.only(left: AppDimensions.p8),
                child: Text(
                  'SYNC NOW',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: fgColor,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
