import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';

enum ButtonVariant {
  primary,
  secondary,
  outline,
  danger,
}

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;
  final double height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
    this.height = AppDimensions.buttonHeight,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    Color fg;
    BorderSide border = BorderSide.none;

    switch (variant) {
      case ButtonVariant.primary:
        bg = AppColors.primary;
        fg = Colors.white;
        break;
      case ButtonVariant.secondary:
        bg = isDark ? AppColors.surfaceElevated : AppColors.borderLight;
        fg = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
        break;
      case ButtonVariant.outline:
        bg = Colors.transparent;
        fg = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
        border = BorderSide(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
          width: 1,
        );
        break;
      case ButtonVariant.danger:
        bg = AppColors.danger;
        fg = Colors.white;
        break;
    }

    final button = ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: bg,
        foregroundColor: fg,
        disabledBackgroundColor: bg.withValues(alpha: 0.5),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          side: border,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.p16,
          vertical: AppDimensions.p12,
        ),
      ),
      child: isLoading
          ? SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(fg),
              ),
            )
          : Row(
              mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: AppDimensions.iconMd, color: fg),
                  const SizedBox(width: AppDimensions.p8),
                ],
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: fg,
                  ),
                ),
              ],
            ),
    );

    if (isFullWidth) {
      return SizedBox(
        width: double.infinity,
        height: height,
        child: button,
      );
    }

    return SizedBox(height: height, child: button);
  }
}
