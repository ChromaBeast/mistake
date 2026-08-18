import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../shared/components/app_button.dart';

class InspectionActionsBar extends StatelessWidget {
  final VoidCallback onFlag;
  final VoidCallback onAccept;
  final VoidCallback onEscalate;
  final VoidCallback onAttachPhoto;

  const InspectionActionsBar({
    super.key,
    required this.onFlag,
    required this.onAccept,
    required this.onEscalate,
    required this.onAttachPhoto,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.p16),
      color: AppColors.surfaceDark,
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Flag Discrepancy',
                    variant: ButtonVariant.danger,
                    icon: Icons.flag_rounded,
                    onPressed: onFlag,
                  ),
                ),
                const SizedBox(width: AppDimensions.p8),
                Expanded(
                  child: AppButton(
                    label: 'Accept & Signoff',
                    variant: ButtonVariant.primary,
                    icon: Icons.check_circle_outline,
                    onPressed: onAccept,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.p8),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Attach Photo',
                    variant: ButtonVariant.secondary,
                    icon: Icons.camera_alt_outlined,
                    height: AppDimensions.buttonHeightSm,
                    onPressed: onAttachPhoto,
                  ),
                ),
                const SizedBox(width: AppDimensions.p8),
                Expanded(
                  child: AppButton(
                    label: 'Escalate to Manager',
                    variant: ButtonVariant.outline,
                    icon: Icons.arrow_upward_rounded,
                    height: AppDimensions.buttonHeightSm,
                    onPressed: onEscalate,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
