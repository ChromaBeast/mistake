import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../models/user_session.dart';
import '../../../../shared/components/app_badge.dart';
import '../../../../shared/components/app_card.dart';
import '../../auth/providers/auth_provider.dart';

class UserRoleCard extends ConsumerWidget {
  const UserRoleCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            auth.session.name,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
          ),
          Text(
            auth.session.email,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
          ),
          const SizedBox(height: AppDimensions.p8),
          AppBadge(
            label: auth.session.role.displayName,
            variant: BadgeVariant.info,
          ),
          const SizedBox(height: AppDimensions.p12),
          const Text(
            'Switch Role for Testing:',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMutedDark),
          ),
          const SizedBox(height: AppDimensions.p6),
          Wrap(
            spacing: 6,
            children: [UserRole.owner, UserRole.manager, UserRole.analyst].map((r) {
              final isCur = auth.session.role == r;
              return ChoiceChip(
                label: Text(r.name.toUpperCase(), style: const TextStyle(fontSize: 10)),
                selected: isCur,
                onSelected: (_) => ref.read(authProvider.notifier).switchRole(r),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
