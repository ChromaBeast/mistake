import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/network/network_status_provider.dart';
import 'package:mobile/shared/components/network_indicator_banner.dart';

void main() {
  group('NetworkIndicatorBanner Widget', () {
    testWidgets('displays offline mode warning when network is offline', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            networkStatusProvider.overrideWith(
              (ref) => NetworkStatusNotifier()..setStatus(NetworkStatus.offline),
            ),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: NetworkIndicatorBanner(),
            ),
          ),
        ),
      );

      await tester.pump();
      expect(find.textContaining('Offline Mode'), findsOneWidget);
    });

    testWidgets('hides banner when network is online with no pending queue items', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            networkStatusProvider.overrideWith(
              (ref) => NetworkStatusNotifier()..setStatus(NetworkStatus.online),
            ),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: NetworkIndicatorBanner(),
            ),
          ),
        ),
      );

      await tester.pump();
      expect(find.byType(SizedBox), findsWidgets);
      expect(find.textContaining('Offline Mode'), findsNothing);
    });
  });
}
