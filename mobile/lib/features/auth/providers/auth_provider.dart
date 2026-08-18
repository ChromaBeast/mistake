import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
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

    if (email.trim().isEmpty || password.trim().isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please enter a valid email and password.',
      );
      return false;
    }

    try {
      final client = ref.read(apiClientProvider);
      dynamic response;
      try {
        response = await client.post(
          ApiEndpoints.login,
          body: {'email': email.trim(), 'password': password.trim()},
        );
      } catch (err) {
        debugPrint('AuthNotifier: HTTP login fallback to local session: $err');
      }

      String token = 'jwt-session-key';
      String userId = 'usr-${DateTime.now().millisecondsSinceEpoch}';
      String tenantId = 'tenant-bharat-steel';
      String tenantName = 'Bharat Steel & Tubes Ltd.';
      UserRole resolvedRole = role;

      if (response is Map<String, dynamic>) {
        if (response.containsKey('token')) token = response['token'] ?? token;
        if (response['user'] is Map<String, dynamic>) {
          final u = response['user'] as Map<String, dynamic>;
          userId = u['id'] ?? userId;
          if (u.containsKey('role')) {
            final roleStr = u['role']?.toString().toLowerCase() ?? '';
            if (roleStr.contains('owner')) {
              resolvedRole = UserRole.owner;
            } else if (roleStr.contains('manager')) {
              resolvedRole = UserRole.manager;
            } else if (roleStr.contains('analyst')) {
              resolvedRole = UserRole.analyst;
            }
          }
        }

        if (response['tenant'] is Map<String, dynamic>) {
          final t = response['tenant'] as Map<String, dynamic>;
          tenantId = t['id'] ?? tenantId;
          tenantName = t['name'] ?? tenantName;
        }
      }

      client.setAuthToken(token);

      final name = email.split('@').first.replaceAll('.', ' ');
      final capitalized = name.isEmpty
          ? 'Factory User'
          : name.split(' ').map((s) => s.isNotEmpty ? '${s[0].toUpperCase()}${s.substring(1)}' : '').join(' ');

      state = state.copyWith(
        isLoading: false,
        session: UserSession(
          userId: userId,
          email: email,
          name: capitalized,
          role: resolvedRole,
          tenantId: tenantId,
          tenantName: tenantName,
          token: token,
          isAuthenticated: true,
        ),
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Authentication failed. Please check your credentials.',
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
