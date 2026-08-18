enum UserRole {
  owner,
  admin,
  manager,
  analyst,
  viewer,
}

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.owner:
        return 'Business Owner';
      case UserRole.admin:
        return 'System Admin';
      case UserRole.manager:
        return 'Operations Manager';
      case UserRole.analyst:
        return 'Discrepancy Analyst';
      case UserRole.viewer:
        return 'Auditor / Viewer';
    }
  }

  bool get canTriage =>
      this == UserRole.owner ||
      this == UserRole.admin ||
      this == UserRole.manager;

  bool get canScanAndInspect => true;
}

class UserSession {
  final String userId;
  final String email;
  final String name;
  final UserRole role;
  final String tenantId;
  final String tenantName;
  final String? token;
  final String? refreshToken;
  final bool isAuthenticated;

  const UserSession({
    required this.userId,
    required this.email,
    required this.name,
    required this.role,
    required this.tenantId,
    required this.tenantName,
    this.token,
    this.refreshToken,
    this.isAuthenticated = true,
  });

  UserSession copyWith({
    String? userId,
    String? email,
    String? name,
    UserRole? role,
    String? tenantId,
    String? tenantName,
    String? token,
    String? refreshToken,
    bool? isAuthenticated,
  }) {
    return UserSession(
      userId: userId ?? this.userId,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      tenantId: tenantId ?? this.tenantId,
      tenantName: tenantName ?? this.tenantName,
      token: token ?? this.token,
      refreshToken: refreshToken ?? this.refreshToken,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }

  static const UserSession unauthenticated = UserSession(
    userId: '',
    email: '',
    name: '',
    role: UserRole.viewer,
    tenantId: '',
    tenantName: '',
    isAuthenticated: false,
  );
}
