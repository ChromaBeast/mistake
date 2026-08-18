import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/document_capture/screens/camera_scanner_screen.dart';
import 'features/barcode_inspection/screens/inspection_screen.dart';
import 'features/triage/screens/triage_screen.dart';
import 'features/notifications/screens/notification_screen.dart';
import 'features/settings/screens/settings_screen.dart';
import 'features/notifications/providers/notification_provider.dart';
import 'shared/components/push_notification_toast.dart';
import 'shared/navigation/bottom_nav_bar.dart';
import 'shared/navigation/navigation_provider.dart';

class MainAppShell extends ConsumerWidget {
  const MainAppShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTab = ref.watch(navigationProvider);
    final notifState = ref.watch(notificationProvider);

    Widget screen;
    switch (currentTab) {
      case AppTab.dashboard:
        screen = const DashboardScreen();
        break;
      case AppTab.capture:
        screen = const CameraScannerScreen();
        break;
      case AppTab.inspect:
        screen = const InspectionScreen();
        break;
      case AppTab.triage:
        screen = const TriageScreen();
        break;
      case AppTab.notifications:
        screen = const NotificationScreen();
        break;
      case AppTab.settings:
        screen = const SettingsScreen();
        break;
    }

    return Scaffold(
      body: Stack(
        children: [
          screen,
          if (notifState.activePushToast != null)
            Positioned(
              top: 40,
              left: 0,
              right: 0,
              child: PushNotificationToast(
                notification: notifState.activePushToast!,
                onTap: () {
                  final notif = notifState.activePushToast!;
                  ref.read(notificationProvider.notifier).dismissToast();
                  ref.read(notificationProvider.notifier).markAsRead(notif.id);
                  if (notif.mistakeId != null) {
                    ref.read(navigationProvider.notifier).goToTriageWithFilter(notif.mistakeId);
                  }
                },
                onDismiss: () => ref.read(notificationProvider.notifier).dismissToast(),
              ),
            ),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        currentTab: currentTab,
        onTabSelected: (tab) => ref.read(navigationProvider.notifier).setTab(tab),
        unreadNotificationsCount: notifState.unreadCount,
      ),
    );
  }
}
