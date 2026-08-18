import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppTab {
  dashboard,
  capture,
  inspect,
  triage,
  notifications,
  settings,
}

class NavigationNotifier extends Notifier<AppTab> {
  @override
  AppTab build() {
    return AppTab.dashboard;
  }

  void setTab(AppTab tab) {
    state = tab;
  }

  void goToTriageWithFilter([String? mistakeId]) {
    state = AppTab.triage;
  }
}

final navigationProvider =
    NotifierProvider<NavigationNotifier, AppTab>(() {
  return NavigationNotifier();
});
