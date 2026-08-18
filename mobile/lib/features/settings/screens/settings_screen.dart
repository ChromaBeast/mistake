import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/sync/sync_queue_notifier.dart';
import '../../../core/theme/theme_mode_provider.dart';
import '../../../shared/components/app_button.dart';
import '../../../shared/components/app_card.dart';
import '../../../shared/components/app_header.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/settings_provider.dart';
import '../widgets/connectivity_simulator_card.dart';
import '../widgets/sync_queue_manager_card.dart';
import '../widgets/user_role_card.dart';
import '../widgets/section_header.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final syncState = ref.watch(syncQueueProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: Column(
        children: [
          const AppHeader(
            title: AppStrings.titleSettings,
            subtitle: AppStrings.deviceDiagnostics,
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppDimensions.p16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: AppStrings.connectivitySimulator),
                  const ConnectivitySimulatorCard(),
                  const SizedBox(height: AppDimensions.p20),
                  SectionHeader(title: '${AppStrings.offlineQueueManager} (${syncState.items.length})'),
                  const SyncQueueManagerCard(),
                  const SizedBox(height: AppDimensions.p20),
                  const SectionHeader(title: AppStrings.activeUserRole),
                  const UserRoleCard(),
                  const SizedBox(height: AppDimensions.p20),
                  const SectionHeader(title: AppStrings.appPreferences),
                  AppCard(
                    child: Column(
                      children: [
                        SwitchListTile(
                          value: isDark,
                          title: const Text(AppStrings.darkModeTheme, style: TextStyle(fontSize: 13, color: Colors.white)),
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          onChanged: (_) => ref.read(themeModeProvider.notifier).toggleTheme(),
                        ),
                        SwitchListTile(
                          value: settings.autoSyncOnWifi,
                          title: const Text(AppStrings.autoSyncOnReconnection, style: TextStyle(fontSize: 13, color: Colors.white)),
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          onChanged: (v) => ref.read(settingsProvider.notifier).toggleAutoSync(v),
                        ),
                        SwitchListTile(
                          value: settings.highContrastScanner,
                          title: const Text(AppStrings.highContrastLaserReticle, style: TextStyle(fontSize: 13, color: Colors.white)),
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          onChanged: (v) => ref.read(settingsProvider.notifier).toggleHighContrast(v),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.p24),
                  AppButton(
                    label: AppStrings.signOutOfSession,
                    variant: ButtonVariant.danger,
                    isFullWidth: true,
                    onPressed: () => ref.read(authProvider.notifier).logout(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
