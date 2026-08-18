import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/models/user_session.dart';

void main() {
  group('AuthNotifier Unit Tests', () {
    test('default build state has demo authenticated session', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final state = container.read(authProvider);
      expect(state.isAuthenticated, isTrue);
      expect(state.session.role, UserRole.owner);
    });

    test('logout clears session to unauthenticated', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      notifier.logout();

      final state = container.read(authProvider);
      expect(state.isAuthenticated, isFalse);
      expect(state.session.userId, isEmpty);
    });

    test('switchRole updates the role while preserving session', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      notifier.switchRole(UserRole.analyst);

      final state = container.read(authProvider);
      expect(state.session.role, UserRole.analyst);
      expect(state.isAuthenticated, isTrue);
    });

    test('login with empty credentials fails with error message', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(authProvider.notifier);
      notifier.logout();

      final result = await notifier.login(email: '', password: '');
      expect(result, isFalse);

      final state = container.read(authProvider);
      expect(state.isAuthenticated, isFalse);
      expect(state.errorMessage, isNotNull);
    });
  });
}
