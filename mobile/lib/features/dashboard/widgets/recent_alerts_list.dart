import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/mistake_item.dart';
import '../../../shared/components/app_card.dart';
import '../../../shared/components/financial_metric_chip.dart';
import '../../../shared/components/severity_indicator_pill.dart';
import '../../../shared/navigation/navigation_provider.dart';

class RecentAlertsList extends ConsumerWidget {
  final List<MistakeItem> alerts;

  const RecentAlertsList({
    super.key,
    required this.alerts,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'LIVE DISCREPANCY FEED',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
                color: AppColors.textSecondaryDark,
              ),
            ),
            TextButton(
              onPressed: () => ref.read(navigationProvider.notifier).setTab(AppTab.triage),
              child: const Text('View Deck →', style: TextStyle(fontSize: 12, color: AppColors.primary)),
            ),
          ],
        ),
        const SizedBox(height: AppDimensions.p8),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: alerts.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.p8),
          itemBuilder: (context, index) {
            final item = alerts[index];
            return AppCard(
              padding: const EdgeInsets.all(AppDimensions.p12),
              onTap: () => ref.read(navigationProvider.notifier).setTab(AppTab.triage),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      SeverityIndicatorPill(severity: item.severity),
                      Text(
                        DateFormatter.formatRelative(item.detectedAt),
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppDimensions.p8),
                  Text(
                    item.title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.p4),
                  Text(
                    item.description,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppDimensions.p8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item.entityName,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                      FinancialMetricChip(
                        amountPaise: item.financialImpactMinor,
                        type: FinancialMetricType.leakage,
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
