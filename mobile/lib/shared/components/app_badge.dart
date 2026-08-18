import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';

enum BadgeVariant {
  neutral,
  success,
  warning,
  danger,
  info,
}

class AppBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final IconData? icon;
  final double fontSize;

  const AppBadge({
    super.key,
    required this.label,
    this.variant = BadgeVariant.neutral,
    this.icon,
    this.fontSize = 11.0,
  });

  Color _getBgColor(bool isDark) {
    switch (variant) {
      case BadgeVariant.neutral:
        return isDark ? AppColors.surfaceElevated : AppColors.borderLight;
      case BadgeVariant.success:
        return AppColors.success.withValues(alpha: 0.15);
      case BadgeVariant.warning:
        return AppColors.warning.withValues(alpha: 0.15);
      case BadgeVariant.danger:
        return AppColors.danger.withValues(alpha: 0.15);
      case BadgeVariant.info:
        return AppColors.info.withValues(alpha: 0.15);
    }
  }

  Color _getTextColor(bool isDark) {
    switch (variant) {
      case BadgeVariant.neutral:
        return isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
      case BadgeVariant.success:
        return AppColors.success;
      case BadgeVariant.warning:
        return AppColors.warning;
      case BadgeVariant.danger:
        return AppColors.danger;
      case BadgeVariant.info:
        return AppColors.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = _getTextColor(isDark);
    final bgColor = _getBgColor(isDark);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p8,
        vertical: AppDimensions.p4,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
        border: Border.all(
          color: textColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 1, color: textColor),
            const SizedBox(width: AppDimensions.p4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: textColor,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
