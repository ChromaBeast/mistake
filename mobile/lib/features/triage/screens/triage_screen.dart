import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/components/app_header.dart';
import '../providers/triage_provider.dart';
import '../widgets/dismiss_reason_sheet.dart';
import '../widgets/triage_action_bar.dart';
import '../widgets/triage_card_stack.dart';
import '../widgets/tally_pill.dart';

/// Screen displaying the executive triage interface for reviewing and deciding on high-value leakage items.
class TriageScreen extends ConsumerWidget {
  const TriageScreen({super.key});

  void _showDismissSheet(BuildContext context, WidgetRef ref) {
    String notes = '';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DismissReasonSheet(
        onSubmit: (reason) {
          ref.read(triageProvider.notifier).dismissCurrent(reason, notes);
        },
        onNotesChanged: (n) => notes = n,
      ),
    );
  }

  void _showEscalateDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceDark,
        title: const Text(AppStrings.escalateTitle, style: TextStyle(fontSize: 16, color: Colors.white)),
        content: TextField(
          controller: controller,
          maxLines: 3,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: const InputDecoration(
            hintText: AppStrings.escalateHint,
            hintStyle: TextStyle(color: AppColors.textMutedDark),
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(AppStrings.cancelLabel),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(triageProvider.notifier).escalateCurrent(
                controller.text.isEmpty ? AppStrings.flaggedForCeo : controller.text,
              );
            },
            child: const Text(AppStrings.escalateLabel),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(triageProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: Column(
        children: [
          AppHeader(
            title: AppStrings.titleTriage,
            subtitle: '${state.remainingCount} ${AppStrings.pendingDecision}',
            actions: [
              IconButton(
                icon: const Icon(Icons.replay_rounded, size: 20),
                onPressed: () => ref.read(triageProvider.notifier).resetDeck(),
                tooltip: 'Reset Deck',
              ),
            ],
          ),
          // Live INR tally ticker
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.p16,
              vertical: AppDimensions.p10,
            ),
            color: AppColors.surfaceDark,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                TallyPill(
                  label: AppStrings.tallyVerified,
                  count: state.verifiedCount,
                  paise: state.verifiedPaiseTally,
                  color: AppColors.success,
                ),
                Container(width: 1, height: 28, color: AppColors.borderDark.withValues(alpha: 0.4)),
                TallyPill(
                  label: AppStrings.tallyDismissed,
                  count: state.dismissedCount,
                  paise: state.dismissedPaiseTally,
                  color: AppColors.danger,
                ),
                Container(width: 1, height: 28, color: AppColors.borderDark.withValues(alpha: 0.4)),
                TallyPill(
                  label: AppStrings.tallyEscalated,
                  count: state.escalatedCount,
                  paise: 0,
                  color: AppColors.warning,
                  hideAmount: true,
                ),
              ],
            ),
          ),
          // Swipeable card deck
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.p16),
              child: TriageCardStack(
                cards: state.deck,
                onSwipeRight: () => ref.read(triageProvider.notifier).verifyCurrent(),
                onSwipeLeft: () => _showDismissSheet(context, ref),
                onSwipeUp: () => _showEscalateDialog(context, ref),
              ),
            ),
          ),
          // Bottom action buttons
          if (!state.isEmpty)
            TriageActionBar(
              onDismiss: () => _showDismissSheet(context, ref),
              onEscalate: () => _showEscalateDialog(context, ref),
              onVerify: () => ref.read(triageProvider.notifier).verifyCurrent(),
            ),
        ],
      ),
    );
  }
}
