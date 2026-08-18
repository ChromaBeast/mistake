import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../models/user_session.dart';
import '../../../shared/components/app_button.dart';
import '../../../shared/components/app_text_field.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController =
      TextEditingController(text: 'vikram.mehta@bharatsteel.co.in');
  final _passwordController = TextEditingController(text: 'Password@123');
  UserRole _selectedRole = UserRole.owner;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    ref.read(authProvider.notifier).login(
          email: _emailController.text,
          password: _passwordController.text,
          role: _selectedRole,
        );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppDimensions.p24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.shield_outlined,
                  size: 48,
                  color: AppColors.primary,
                ),
                const SizedBox(height: AppDimensions.p12),
                const Text(
                  'MISTAKE',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                    color: AppColors.textPrimaryDark,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppDimensions.p4),
                const Text(
                  'Factory Floor Capture & Executive Triage',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondaryDark,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppDimensions.p32),
                if (authState.errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.p12),
                    decoration: BoxDecoration(
                      color: AppColors.danger.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                      border: Border.all(color: AppColors.danger),
                    ),
                    child: Text(
                      authState.errorMessage!,
                      style: const TextStyle(
                        color: AppColors.danger,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppDimensions.p16),
                ],
                AppTextField(
                  label: 'Work Email',
                  hint: 'name@company.com',
                  controller: _emailController,
                  prefixIcon: const Icon(Icons.email_outlined, size: 20),
                ),
                const SizedBox(height: AppDimensions.p16),
                AppTextField(
                  label: 'Password',
                  hint: '••••••••',
                  controller: _passwordController,
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_outline, size: 20),
                ),
                const SizedBox(height: AppDimensions.p20),
                const Text(
                  'Select Role Persona for Demo',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondaryDark,
                  ),
                ),
                const SizedBox(height: AppDimensions.p8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    UserRole.owner,
                    UserRole.manager,
                    UserRole.analyst,
                  ].map((role) {
                    final isSelected = _selectedRole == role;
                    return ChoiceChip(
                      label: Text(role.displayName),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) setState(() => _selectedRole = role);
                      },
                      selectedColor: AppColors.primary,
                      backgroundColor: AppColors.surfaceElevated,
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? Colors.white : AppColors.textSecondaryDark,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: AppDimensions.p24),
                AppButton(
                  label: 'Sign In to Workspace',
                  isLoading: authState.isLoading,
                  isFullWidth: true,
                  onPressed: _handleLogin,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
