import 'package:flutter_riverpod/flutter_riverpod.dart';

class AppSettings {
  final bool autoSyncOnWifi;
  final bool highContrastScanner;
  final bool soundFeedback;

  const AppSettings({
    this.autoSyncOnWifi = true,
    this.highContrastScanner = true,
    this.soundFeedback = true,
  });

  AppSettings copyWith({
    bool? autoSyncOnWifi,
    bool? highContrastScanner,
    bool? soundFeedback,
  }) {
    return AppSettings(
      autoSyncOnWifi: autoSyncOnWifi ?? this.autoSyncOnWifi,
      highContrastScanner: highContrastScanner ?? this.highContrastScanner,
      soundFeedback: soundFeedback ?? this.soundFeedback,
    );
  }
}

class SettingsNotifier extends Notifier<AppSettings> {
  @override
  AppSettings build() {
    return const AppSettings();
  }

  void toggleAutoSync(bool val) => state = state.copyWith(autoSyncOnWifi: val);
  void toggleHighContrast(bool val) => state = state.copyWith(highContrastScanner: val);
  void toggleSoundFeedback(bool val) => state = state.copyWith(soundFeedback: val);
}

final settingsProvider =
    NotifierProvider<SettingsNotifier, AppSettings>(() {
  return SettingsNotifier();
});
