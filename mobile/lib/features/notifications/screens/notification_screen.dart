import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../shared/components/app_button.dart';
import '../../../shared/components/app_header.dart';
import '../../../shared/navigation/navigation_provider.dart';
import '../providers/notification_provider.dart';
import '../widgets/notification_list_tile.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifState = ref.watch(notificationProvider);
    final notifier = ref.read(notificationProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: Column(
        children: [
          AppHeader(
            title: 'NOTIFICATIONS',
            subtitle: '${notifState.unreadCount} unread system alerts',
            actions: [
              if (notifState.unreadCount > 0)
                TextButton(
                  onPressed: () => notifier.markAllAsRead(),
                  child: const Text('Mark Read', style: TextStyle(fontSize: 12, color: AppColors.primary)),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(AppDimensions.p16),
            child: AppButton(
              label: 'Simulate High-Value Leak Alert 🚨',
              variant: ButtonVariant.outline,
              isFullWidth: true,
              onPressed: () => notifier.simulateHighValueAlert(),
            ),
          ),
          Expanded(
            child: notifState.items.isEmpty
                ? const Center(
                    child: Text(
                      'No notifications in log.',
                      style: TextStyle(color: AppColors.textMutedDark),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: AppDimensions.p16),
                    itemCount: notifState.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.p8),
                    itemBuilder: (context, index) {
                      final item = notifState.items[index];
                      return NotificationListTile(
                        item: item,
                        onTap: () {
                          notifier.markAsRead(item.id);
                          if (item.mistakeId != null) {
                            ref.read(navigationProvider.notifier).goToTriageWithFilter(item.mistakeId);
                          }
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
