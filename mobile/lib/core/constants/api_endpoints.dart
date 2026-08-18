class ApiEndpoints {
  const ApiEndpoints._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080/api/v1',
  );


  // Auth endpoints
  static const String login = '$baseUrl/auth/login';
  static const String signup = '$baseUrl/auth/signup';
  static const String mfaVerify = '$baseUrl/auth/mfa/verify';

  // Tenant & Users
  static const String tenant = '$baseUrl/tenant';
  static const String users = '$baseUrl/users';

  // Data sources & Documents
  static const String dataSources = '$baseUrl/data-sources';
  static String dataSourceById(String id) => '$baseUrl/data-sources/$id';

  // Entities & Review queue
  static const String entities = '$baseUrl/entities';
  static const String entityReviewQueue = '$baseUrl/entities/review-queue';
  static String entityById(String id) => '$baseUrl/entities/$id';

  // Discrepancies / Mistakes
  static const String mistakes = '$baseUrl/mistakes';
  static const String dashboardSummary = '$baseUrl/dashboard/summary';
  static String mistakeById(String id) => '$baseUrl/mistakes/$id';
  static String mistakeStatus(String id) => '$baseUrl/mistakes/$id/status';
  static String mistakeAssign(String id) => '$baseUrl/mistakes/$id/assign';

  // Notifications & Audit
  static const String notifications = '$baseUrl/notifications';
  static String notificationRead(String id) => '$baseUrl/notifications/$id/read';
  static const String auditLogs = '$baseUrl/audit-logs';
  static const String search = '$baseUrl/search';
}
