import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/components/app_card.dart';

class FinancialKpiCard extends StatelessWidget {
  final String title;
  final int amountPaise;
  final String subtitle;
  final bool isLeakage;
  final IconData icon;

  const FinancialKpiCard({
    super.key,
    required this.title,
    required this.amountPaise,
    required this.subtitle,
    required this.isLeakage,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = isLeakage ? AppColors.danger : AppColors.success;
    final formattedAmount = CurrencyFormatter.formatPaise(amountPaise);

    return AppCard(
      padding: const EdgeInsets.all(AppDimensions.p16),
      borderColor: accentColor.withValues(alpha: 0.35),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.6,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(AppDimensions.p4),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 14, color: accentColor),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.p8),
          Text(
            formattedAmount,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              fontFamily: 'monospace',
              letterSpacing: -0.5,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: AppDimensions.p4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 11,
              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
            ),
          ),
        ],
      ),
    );
  }
}
