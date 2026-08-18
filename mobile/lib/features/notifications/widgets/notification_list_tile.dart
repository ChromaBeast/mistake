import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/notification_item.dart';
import '../../../shared/components/app_card.dart';

class NotificationListTile extends StatelessWidget {
  final NotificationItem item;
  final VoidCallback onTap;

  const NotificationListTile({
    super.key,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color iconColor;
    IconData icon;

    switch (item.severity) {
      case NotificationSeverity.critical:
        iconColor = AppColors.danger;
        icon = Icons.error_rounded;
        break;
      case NotificationSeverity.warning:
        iconColor = AppColors.warning;
        icon = Icons.warning_rounded;
        break;
      case NotificationSeverity.info:
        iconColor = AppColors.info;
        icon = Icons.info_rounded;
        break;
    }

    return AppCard(
      padding: const EdgeInsets.all(AppDimensions.p12),
      borderColor: item.isRead ? null : iconColor.withValues(alpha: 0.4),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AppDimensions.p6),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: AppDimensions.p12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item.title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w800,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        ),
                      ),
                    ),
                    if (!item.isRead)
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(color: iconColor, shape: BoxShape.circle),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.message,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  DateFormatter.formatRelative(item.timestamp),
                  style: TextStyle(
                    fontSize: 10,
                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
