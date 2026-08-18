import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../models/user_session.dart';
import '../../../shared/components/app_header.dart';
import '../../../shared/components/network_indicator_banner.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/financial_kpi_card.dart';
import '../widgets/quick_action_grid.dart';
import '../widgets/recent_alerts_list.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metrics = ref.watch(dashboardProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: Column(
        children: [
          AppHeader(
            title: 'MISTAKE RADAR',
            subtitle: '${authState.session.tenantName} • ${authState.session.role.displayName}',
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh_rounded, size: 20),
                onPressed: () => ref.read(dashboardProvider.notifier).refresh(),
                tooltip: 'Refresh Metrics',
              ),
            ],
          ),
          const NetworkIndicatorBanner(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppDimensions.p16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: FinancialKpiCard(
                          title: 'Active Leakage',
                          amountPaise: metrics.totalLeakagePaise,
                          subtitle: '${metrics.openMistakesCount} Open Inconsistencies',
                          isLeakage: true,
                          icon: Icons.trending_down_rounded,
                        ),
                      ),
                      const SizedBox(width: AppDimensions.p12),
                      Expanded(
                        child: FinancialKpiCard(
                          title: 'Protected Value',
                          amountPaise: metrics.protectedValuePaise,
                          subtitle: '${metrics.resolvedCount} Resolved & Recovered',
                          isLeakage: false,
                          icon: Icons.shield_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppDimensions.p20),
                  const QuickActionGrid(),
                  const SizedBox(height: AppDimensions.p20),
                  RecentAlertsList(alerts: metrics.recentAlerts),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
