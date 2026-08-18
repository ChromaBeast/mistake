import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../models/mistake_item.dart';
import '../../../shared/components/app_button.dart';
import '../../../shared/components/app_text_field.dart';

class DismissReasonSheet extends StatefulWidget {
  final ValueChanged<MistakeDismissReason> onSubmit;
  final ValueChanged<String>? onNotesChanged;

  const DismissReasonSheet({
    super.key,
    required this.onSubmit,
    this.onNotesChanged,
  });

  @override
  State<DismissReasonSheet> createState() => _DismissReasonSheetState();
}

class _DismissReasonSheetState extends State<DismissReasonSheet> {
  MistakeDismissReason? _selectedReason;
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.p24),
      decoration: const BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusLg)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'MANDATORY DISMISSAL REASON',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Per compliance policy, every discrepancy dismissal must be categorized.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
              ),
              const SizedBox(height: AppDimensions.p16),
              ...MistakeDismissReason.values.map((reason) {
                final isSelected = _selectedReason == reason;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    onTap: () => setState(() => _selectedReason = reason),
                    borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : Colors.transparent,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                            size: 16,
                            color: isSelected ? AppColors.primary : AppColors.textMutedDark,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              reason.label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              const SizedBox(height: AppDimensions.p12),
              AppTextField(
                label: 'Audit Notes (Optional)',
                hint: 'e.g. Approved under Credit Memo #CM-901',
                controller: _notesController,
                maxLines: 2,
              ),
              const SizedBox(height: AppDimensions.p20),
              AppButton(
                label: 'Confirm Dismissal',
                variant: ButtonVariant.danger,
                onPressed: _selectedReason != null
                    ? () {
                        widget.onSubmit(_selectedReason!);
                        if (widget.onNotesChanged != null) {
                          widget.onNotesChanged!(_notesController.text);
                        }
                        Navigator.pop(context);
                      }
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
