import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/network/network_status_provider.dart';
import '../../../../shared/components/app_card.dart';

class ConnectivitySimulatorCard extends ConsumerWidget {
  const ConnectivitySimulatorCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final network = ref.watch(networkStatusProvider);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Simulate factory floor signal variations to verify offline queueing & replay behavior.',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
          ),
          const SizedBox(height: AppDimensions.p12),
          ...NetworkStatus.values.map((status) {
            final isSelected = network == status;
            return InkWell(
              onTap: () => ref.read(networkStatusProvider.notifier).setStatus(status),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppDimensions.p6),
                child: Row(
                  children: [
                    Icon(
                      isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                      size: 18,
                      color: isSelected ? AppColors.primary : AppColors.textMutedDark,
                    ),
                    const SizedBox(width: AppDimensions.p10),
                    Text(
                      status.label,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
