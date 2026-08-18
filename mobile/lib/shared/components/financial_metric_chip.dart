import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';

enum FinancialMetricType {
  leakage,
  protected,
  neutral,
}

class FinancialMetricChip extends StatelessWidget {
  final int amountPaise;
  final FinancialMetricType type;
  final String? label;
  final bool isCompact;

  const FinancialMetricChip({
    super.key,
    required this.amountPaise,
    this.type = FinancialMetricType.leakage,
    this.label,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    Color fgColor;
    Color bgColor;

    switch (type) {
      case FinancialMetricType.leakage:
        fgColor = AppColors.danger;
        bgColor = AppColors.danger.withValues(alpha: 0.12);
        break;
      case FinancialMetricType.protected:
        fgColor = AppColors.success;
        bgColor = AppColors.success.withValues(alpha: 0.12);
        break;
      case FinancialMetricType.neutral:
        fgColor = AppColors.primary;
        bgColor = AppColors.primary.withValues(alpha: 0.12);
        break;
    }

    final formatted = isCompact
        ? CurrencyFormatter.formatCompactPaise(amountPaise)
        : CurrencyFormatter.formatPaise(amountPaise);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p8,
        vertical: AppDimensions.p4,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        border: Border.all(color: fgColor.withValues(alpha: 0.25), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (label != null) ...[
            Text(
              '$label: ',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: fgColor.withValues(alpha: 0.8),
              ),
            ),
          ],
          Text(
            formatted,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              fontFamily: 'monospace',
              color: fgColor,
            ),
          ),
        ],
      ),
    );
  }
}
