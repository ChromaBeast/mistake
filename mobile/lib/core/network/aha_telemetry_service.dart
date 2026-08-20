import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../constants/api_endpoints.dart';

final ahaTelemetryServiceProvider = Provider<AhaTelemetryService>((ref) {
  return AhaTelemetryService();
});

class AhaTelemetryService {
  final int _initTime = DateTime.now().millisecondsSinceEpoch;

  Future<void> trackMilestone({
    required String eventType,
    String? metadata,
    String? token,
  }) async {
    final elapsedMs = DateTime.now().millisecondsSinceEpoch - _initTime;
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}/api/v1/analytics/events');
      await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'event_type': eventType,
          'duration_ms': elapsedMs,
          'metadata': metadata ?? '',
        }),
      );
    } catch (_) {
      // Non-blocking telemetry
    }
  }
}
