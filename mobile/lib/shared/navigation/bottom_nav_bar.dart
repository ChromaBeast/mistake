import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import 'navigation_provider.dart';

class BottomNavBar extends StatelessWidget {
  final AppTab currentTab;
  final ValueChanged<AppTab> onTabSelected;
  final int unreadNotificationsCount;

  const BottomNavBar({
    super.key,
    required this.currentTab,
    required this.onTabSelected,
    this.unreadNotificationsCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    const tabs = [
      _NavItem(tab: AppTab.dashboard, icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
      _NavItem(tab: AppTab.capture, icon: Icons.document_scanner_outlined, activeIcon: Icons.document_scanner, label: 'Scan Doc'),
      _NavItem(tab: AppTab.inspect, icon: Icons.qr_code_scanner_outlined, activeIcon: Icons.qr_code_scanner, label: 'Inspect'),
      _NavItem(tab: AppTab.triage, icon: Icons.style_outlined, activeIcon: Icons.style, label: 'Triage'),
      _NavItem(
        tab: AppTab.notifications,
        icon: Icons.notifications_none_outlined,
        activeIcon: Icons.notifications,
        label: 'Alerts',
      ),
    ];

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderDark.withValues(alpha: 0.4) : AppColors.borderLight,
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: tabs.map((item) {
              final isSelected = currentTab == item.tab;
              final color = isSelected
                  ? AppColors.primary
                  : (isDark ? AppColors.textMutedDark : AppColors.textMutedLight);

              return Expanded(
                child: InkWell(
                  onTap: () => onTabSelected(item.tab),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            isSelected ? item.activeIcon : item.icon,
                            color: color,
                            size: 22,
                          ),
                          if (item.tab == AppTab.notifications && unreadNotificationsCount > 0)
                            Positioned(
                              right: -6,
                              top: -4,
                              child: Container(
                                padding: const EdgeInsets.all(3),
                                decoration: const BoxDecoration(
                                  color: AppColors.danger,
                                  shape: BoxShape.circle,
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 14,
                                  minHeight: 14,
                                ),
                                child: Text(
                                  unreadNotificationsCount > 9 ? '9+' : '$unreadNotificationsCount',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: color,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final AppTab tab;
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.tab,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
