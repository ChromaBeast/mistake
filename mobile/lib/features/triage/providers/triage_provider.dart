import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/sync/sync_queue_item.dart';
import '../../../core/sync/sync_queue_notifier.dart';
import '../../../models/mistake_item.dart';
import '../models/triage_mock_data.dart';

class TriageState {
  final List<MistakeItem> deck;
  final int verifiedCount;
  final int dismissedCount;
  final int escalatedCount;
  final int verifiedPaiseTally;
  final int dismissedPaiseTally;

  const TriageState({
    this.deck = const [],
    this.verifiedCount = 0,
    this.dismissedCount = 0,
    this.escalatedCount = 0,
    this.verifiedPaiseTally = 0,
    this.dismissedPaiseTally = 0,
  });

  bool get isEmpty => deck.isEmpty;
  MistakeItem? get topCard => deck.isNotEmpty ? deck.first : null;
  int get remainingCount => deck.length;

  TriageState copyWith({
    List<MistakeItem>? deck,
    int? verifiedCount,
    int? dismissedCount,
    int? escalatedCount,
    int? verifiedPaiseTally,
    int? dismissedPaiseTally,
  }) {
    return TriageState(
      deck: deck ?? this.deck,
      verifiedCount: verifiedCount ?? this.verifiedCount,
      dismissedCount: dismissedCount ?? this.dismissedCount,
      escalatedCount: escalatedCount ?? this.escalatedCount,
      verifiedPaiseTally: verifiedPaiseTally ?? this.verifiedPaiseTally,
      dismissedPaiseTally: dismissedPaiseTally ?? this.dismissedPaiseTally,
    );
  }
}

class TriageNotifier extends Notifier<TriageState> {
  @override
  TriageState build() {
    return TriageState(deck: TriageMockData.defaultDeck);
  }

  void resetDeck() {
    state = TriageState(
      deck: TriageMockData.defaultDeck,
    );
  }

  void verifyCurrent() {
    if (state.deck.isEmpty) return;
    final card = state.deck.first;
    final remaining = state.deck.sublist(1);

    state = state.copyWith(
      deck: remaining,
      verifiedCount: state.verifiedCount + 1,
      verifiedPaiseTally: state.verifiedPaiseTally + card.financialImpactMinor,
    );

    ref.read(syncQueueProvider.notifier).enqueue(
      type: SyncActionType.verifyMistake,
      title: 'Verified Mistake ${card.id}',
      payload: {'id': card.id, 'status': 'verified', 'amountPaise': card.financialImpactMinor},
    );
  }

  void dismissCurrent(MistakeDismissReason reason, String notes) {
    if (state.deck.isEmpty) return;
    final card = state.deck.first;
    final remaining = state.deck.sublist(1);

    state = state.copyWith(
      deck: remaining,
      dismissedCount: state.dismissedCount + 1,
      dismissedPaiseTally: state.dismissedPaiseTally + card.financialImpactMinor,
    );

    ref.read(syncQueueProvider.notifier).enqueue(
      type: SyncActionType.dismissMistake,
      title: 'Dismissed Mistake ${card.id} (${reason.label})',
      payload: {
        'id': card.id,
        'status': 'dismissed',
        'reason': reason.name,
        'notes': notes,
        'amountPaise': card.financialImpactMinor,
      },
    );
  }

  void escalateCurrent(String note) {
    if (state.deck.isEmpty) return;
    final card = state.deck.first;
    final remaining = state.deck.sublist(1);

    state = state.copyWith(
      deck: remaining,
      escalatedCount: state.escalatedCount + 1,
    );

    ref.read(syncQueueProvider.notifier).enqueue(
      type: SyncActionType.escalateMistake,
      title: 'Escalated Mistake ${card.id} to Management',
      payload: {'id': card.id, 'status': 'escalated', 'notes': note},
    );
  }
}

final triageProvider =
    NotifierProvider<TriageNotifier, TriageState>(() {
  return TriageNotifier();
});
