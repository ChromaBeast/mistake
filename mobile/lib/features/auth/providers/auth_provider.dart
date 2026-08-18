import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/user_session.dart';

class AuthState {
  final UserSession session;
  final bool isLoading;
  final String? errorMessage;

  const AuthState({
    this.session = UserSession.unauthenticated,
    this.isLoading = false,
    this.errorMessage,
  });

  bool get isAuthenticated => session.isAuthenticated;

  AuthState copyWith({
    UserSession? session,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AuthState(
      session: session ?? this.session,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    return const AuthState(
      session: UserSession(
        userId: 'usr-demo-01',
        email: 'vikram.mehta@bharatsteel.co.in',
        name: 'Vikram Mehta',
        role: UserRole.owner,
        tenantId: 'tenant-bharat-steel',
        tenantName: 'Bharat Steel & Tubes Ltd.',
        token: 'demo-jwt-token-owner',
        isAuthenticated: true,
      ),
    );
  }

  Future<bool> login({
    required String email,
    required String password,
    UserRole role = UserRole.owner,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      await Future.delayed(const Duration(milliseconds: 500));

      if (email.trim().isEmpty || password.trim().isEmpty) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Please enter a valid email and password.',
        );
        return false;
      }

      final name = email.split('@').first.replaceAll('.', ' ');
      final capitalized = name.isEmpty
          ? 'Factory User'
          : name.split(' ').map((s) => s.isNotEmpty ? '${s[0].toUpperCase()}${s.substring(1)}' : '').join(' ');

      state = state.copyWith(
        isLoading: false,
        session: UserSession(
          userId: 'usr-${DateTime.now().millisecondsSinceEpoch}',
          email: email,
          name: capitalized,
          role: role,
          tenantId: 'tenant-bharat-steel',
          tenantName: 'Bharat Steel & Tubes Ltd.',
          token: 'jwt-auth-session-key',
          isAuthenticated: true,
        ),
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'An error occurred during login.',
      );
      return false;
    }
  }

  void switchRole(UserRole newRole) {
    if (!state.isAuthenticated) return;
    state = state.copyWith(
      session: UserSession(
        userId: state.session.userId,
        email: state.session.email,
        name: state.session.name,
        role: newRole,
        tenantId: state.session.tenantId,
        tenantName: state.session.tenantName,
        token: state.session.token,
        isAuthenticated: true,
      ),
    );
  }

  void logout() {
    state = const AuthState(session: UserSession.unauthenticated);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
