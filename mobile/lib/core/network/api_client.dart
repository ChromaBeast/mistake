import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;


class ApiException implements Exception {
  final int statusCode;
  final String message;
  final dynamic details;

  const ApiException({
    required this.statusCode,
    required this.message,
    this.details,
  });

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  final http.Client _httpClient;
  String? _authToken;
  String? _refreshToken;
  final String? _refreshEndpoint;

  ApiClient({
    http.Client? httpClient,
    String? refreshEndpoint,
  })  : _httpClient = httpClient ?? http.Client(),
        _refreshEndpoint = refreshEndpoint;

  void setTokens({String? accessToken, String? refreshToken}) {
    _authToken = accessToken;
    _refreshToken = refreshToken;
  }

  void setAuthToken(String? token) {
    _authToken = token;
  }

  Map<String, String> _buildHeaders([Map<String, String>? additional]) {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    if (additional != null) {
      headers.addAll(additional);
    }
    return headers;
  }

  Future<dynamic> get(String url, {Map<String, String>? headers}) async {
    return _sendWithRetry(() => _httpClient.get(Uri.parse(url), headers: _buildHeaders(headers)));
  }

  Future<dynamic> post(String url, {dynamic body, Map<String, String>? headers}) async {
    return _sendWithRetry(() => _httpClient.post(
          Uri.parse(url),
          headers: _buildHeaders(headers),
          body: body != null ? jsonEncode(body) : null,
        ));
  }

  Future<dynamic> patch(String url, {dynamic body, Map<String, String>? headers}) async {
    return _sendWithRetry(() => _httpClient.patch(
          Uri.parse(url),
          headers: _buildHeaders(headers),
          body: body != null ? jsonEncode(body) : null,
        ));
  }

  Future<dynamic> _sendWithRetry(Future<http.Response> Function() action) async {
    http.Response response = await action();

    // If 401 Unauthorized and refresh token exists, attempt auto-refresh and retry once
    if (response.statusCode == 401 && _refreshToken != null && _refreshEndpoint != null) {
      final refreshed = await _tryRefreshToken();
      if (refreshed) {
        response = await action();
      }
    }
    return _handleResponse(response);
  }

  Future<bool> _tryRefreshToken() async {
    if (_refreshToken == null || _refreshEndpoint == null) return false;
    try {
      final res = await _httpClient.post(
        Uri.parse(_refreshEndpoint!),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': _refreshToken}),
      );
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        if (decoded is Map<String, dynamic> && decoded.containsKey('token')) {
          _authToken = decoded['token'];
          if (decoded.containsKey('refresh_token')) {
            _refreshToken = decoded['refresh_token'];
          }
          return true;
        }
      }
    } catch (e, stack) {
      debugPrint('ApiClient: failed to auto-refresh token: $e\n$stack');
    }
    return false;
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }

    String message = 'HTTP Request failed with status ${response.statusCode}';
    dynamic details;
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic> && decoded.containsKey('error')) {
        message = decoded['error']['message'] ?? message;
        details = decoded['error']['details'];
      }
    } on FormatException catch (e, stack) {
      debugPrint('ApiClient: error parsing error response body: $e\n$stack');
    }

    throw ApiException(
      statusCode: response.statusCode,
      message: message,
      details: details,
    );
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

