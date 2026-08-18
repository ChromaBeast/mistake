import 'package:flutter_riverpod/flutter_riverpod.dart';

enum NetworkStatus {
  online,
  poorSignal,
  offline,
}

extension NetworkStatusExtension on NetworkStatus {
  bool get isConnected => this != NetworkStatus.offline;
  bool get isPoor => this == NetworkStatus.poorSignal;
  bool get isOffline => this == NetworkStatus.offline;

  String get label {
    switch (this) {
      case NetworkStatus.online:
        return 'Online (4G/Wi-Fi)';
      case NetworkStatus.poorSignal:
        return 'Poor Signal (2G Edge)';
      case NetworkStatus.offline:
        return 'Offline (Basement Mode)';
    }
  }
}

class NetworkStatusNotifier extends StateNotifier<NetworkStatus> {
  NetworkStatusNotifier() : super(NetworkStatus.online);

  void setStatus(NetworkStatus status) {
    state = status;
  }

  void toggleOnlineOffline() {
    state = state == NetworkStatus.online
        ? NetworkStatus.offline
        : NetworkStatus.online;
  }
}

final networkStatusProvider =
    StateNotifierProvider<NetworkStatusNotifier, NetworkStatus>((ref) {
  return NetworkStatusNotifier();
});
