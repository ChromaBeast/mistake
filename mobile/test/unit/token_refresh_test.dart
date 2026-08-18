import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mobile/core/network/api_client.dart';

void main() {
  group('ApiClient Token Refresh Tests', () {
    test('auto-refreshes token on 401 and retries original request', () async {
      int requestCount = 0;
      int refreshCount = 0;

      final mockHttp = MockClient((request) async {
        if (request.url.path == '/api/v1/auth/refresh') {
          refreshCount++;
          final body = jsonDecode(request.body);
          if (body['refresh_token'] == 'valid-refresh-token') {
            return http.Response(
              jsonEncode({'token': 'new-access-token', 'refresh_token': 'new-refresh-token'}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response('{"error":{"message":"Invalid refresh token"}}', 401);
        }

        if (request.url.path == '/api/v1/data') {
          requestCount++;
          // First request fails with 401
          if (request.headers['Authorization'] != 'Bearer new-access-token') {
            return http.Response('{"error":{"message":"Token expired"}}', 401);
          }
          // Retry with fresh token succeeds
          return http.Response(
            jsonEncode({'data': 'success_payload'}),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        return http.Response('Not found', 404);
      });

      final client = ApiClient(
        httpClient: mockHttp,
        refreshEndpoint: 'https://api.example.com/api/v1/auth/refresh',
      );
      client.setTokens(accessToken: 'expired-access-token', refreshToken: 'valid-refresh-token');

      final result = await client.get('https://api.example.com/api/v1/data');

      expect(result['data'], 'success_payload');
      expect(requestCount, 2);
      expect(refreshCount, 1);
    });

    test('throws ApiException when both access and refresh tokens are invalid', () async {
      final mockHttp = MockClient((request) async {
        return http.Response('{"error":{"message":"Unauthorized"}}', 401);
      });

      final client = ApiClient(
        httpClient: mockHttp,
        refreshEndpoint: 'https://api.example.com/api/v1/auth/refresh',
      );
      client.setTokens(accessToken: 'bad-token', refreshToken: 'bad-refresh');

      expect(
        () => client.get('https://api.example.com/api/v1/data'),
        throwsA(isA<ApiException>()),
      );
    });
  });
}
