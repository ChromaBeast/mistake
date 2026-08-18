import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../shared/navigation/navigation_provider.dart';

class QuickActionGrid extends ConsumerWidget {
  const QuickActionGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final actions = [
      _ActionData(
        title: 'Scan Document',
        subtitle: 'Multi-page camera with edge detection',
        icon: Icons.document_scanner_rounded,
        color: AppColors.primary,
        onTap: () => ref.read(navigationProvider.notifier).setTab(AppTab.capture),
      ),
      _ActionData(
        title: 'Floor Inspection',
        subtitle: 'Laser QR / E-Way bill scanner',
        icon: Icons.qr_code_scanner_rounded,
        color: AppColors.info,
        onTap: () => ref.read(navigationProvider.notifier).setTab(AppTab.inspect),
      ),
      _ActionData(
        title: 'Executive Triage',
        subtitle: 'Swipeable discrepancy deck',
        icon: Icons.style_rounded,
        color: AppColors.danger,
        onTap: () => ref.read(navigationProvider.notifier).setTab(AppTab.triage),
      ),
      _ActionData(
        title: 'Offline Sync Hub',
        subtitle: 'Replay queue & network controls',
        icon: Icons.sync_alt_rounded,
        color: AppColors.warning,
        onTap: () => ref.read(navigationProvider.notifier).setTab(AppTab.settings),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'QUICK ACTIONS',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.8,
            color: AppColors.textSecondaryDark,
          ),
        ),
        const SizedBox(height: AppDimensions.p12),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: AppDimensions.p12,
          mainAxisSpacing: AppDimensions.p12,
          childAspectRatio: 1.25,
          children: actions.map((act) => _ActionCard(data: act)).toList(),
        ),
      ],
    );
  }
}

class _ActionData {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });
}

class _ActionCard extends StatelessWidget {
  final _ActionData data;

  const _ActionCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
      child: InkWell(
        onTap: data.onTap,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        child: Container(
          padding: const EdgeInsets.all(AppDimensions.p12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
            border: Border.all(
              color: isDark
                  ? AppColors.borderDark.withValues(alpha: 0.5)
                  : AppColors.borderLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(AppDimensions.p8),
                decoration: BoxDecoration(
                  color: data.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                ),
                child: Icon(data.icon, size: 20, color: data.color),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    data.subtitle,
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
