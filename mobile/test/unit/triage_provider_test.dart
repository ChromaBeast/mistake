import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/triage/providers/triage_provider.dart';
import 'package:mobile/models/mistake_item.dart';

void main() {
  group('TriageNotifier', () {
    test('initializes with default deck', () {
      final container = ProviderContainer();
      final state = container.read(triageProvider);

      expect(state.deck.length, equals(3));
      expect(state.verifiedCount, equals(0));
      expect(state.dismissedCount, equals(0));
      expect(state.escalatedCount, equals(0));
      expect(state.isEmpty, isFalse);
    });

    test('verifies current card and tallies financial paise impact', () {
      final container = ProviderContainer();
      final notifier = container.read(triageProvider.notifier);

      final firstCard = container.read(triageProvider).deck.first;
      final expectedImpact = firstCard.financialImpactMinor;

      notifier.verifyCurrent();

      final state = container.read(triageProvider);
      expect(state.verifiedCount, equals(1));
      expect(state.verifiedPaiseTally, equals(expectedImpact));
      expect(state.deck.length, equals(2));
    });

    test('dismisses current card with reason and updates dismissed tally', () {
      final container = ProviderContainer();
      final notifier = container.read(triageProvider.notifier);

      final firstCard = container.read(triageProvider).deck.first;
      final expectedImpact = firstCard.financialImpactMinor;

      notifier.dismissCurrent(
        MistakeDismissReason.expectedCommercialDiscount,
        'Authorized trade rebate',
      );

      final state = container.read(triageProvider);
      expect(state.dismissedCount, equals(1));
      expect(state.dismissedPaiseTally, equals(expectedImpact));
      expect(state.deck.length, equals(2));
    });

    test('escalates card without adding to verified or dismissed tally', () {
      final container = ProviderContainer();
      final notifier = container.read(triageProvider.notifier);

      notifier.escalateCurrent('Needs Director review');

      final state = container.read(triageProvider);
      expect(state.escalatedCount, equals(1));
      expect(state.verifiedPaiseTally, equals(0));
      expect(state.dismissedPaiseTally, equals(0));
      expect(state.deck.length, equals(2));
    });
  });
}
