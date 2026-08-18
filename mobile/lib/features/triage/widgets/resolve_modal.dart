import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../shared/components/app_button.dart';
import '../../../shared/components/app_text_field.dart';

class ResolveModal extends StatefulWidget {
  final ValueChanged<String> onResolve;

  const ResolveModal({super.key, required this.onResolve});

  @override
  State<ResolveModal> createState() => _ResolveModalState();
}

class _ResolveModalState extends State<ResolveModal> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'RESOLVE & SIGN OFF DISCREPANCY',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: AppColors.textPrimaryDark,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Record how the financial variance was resolved or recovered from supplier.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
            ),
            const SizedBox(height: AppDimensions.p16),
            AppTextField(
              label: 'Resolution Summary / Credit Note #',
              hint: 'e.g. Supplier issued credit note CN-402 for ₹47,500.',
              controller: _controller,
              maxLines: 3,
            ),
            const SizedBox(height: AppDimensions.p20),
            AppButton(
              label: 'Sign Off Resolution',
              variant: ButtonVariant.primary,
              onPressed: () {
                final notes = _controller.text.trim().isEmpty
                    ? 'Resolved per audit ledger'
                    : _controller.text.trim();
                widget.onResolve(notes);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
