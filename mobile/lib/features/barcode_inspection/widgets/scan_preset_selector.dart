import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';

class ScanPresetSelector extends StatelessWidget {
  final String selectedBarcode;
  final ValueChanged<String> onSelectPreset;

  const ScanPresetSelector({
    super.key,
    required this.selectedBarcode,
    required this.onSelectPreset,
  });

  @override
  Widget build(BuildContext context) {
    final presets = [
      {'code': 'EWAY-8849-2091-IN', 'label': 'GST E-Way (Qty Short)'},
      {'code': 'PO-QR-3892-HIND', 'label': 'PO QR (Price Surge)'},
      {'code': 'INV-MATCH-4100', 'label': 'Invoice 128 (Clean Match)'},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.p16),
      child: Row(
        children: presets.map((preset) {
          final isSelected = selectedBarcode == preset['code'];
          return Padding(
            padding: const EdgeInsets.only(right: AppDimensions.p8),
            child: ChoiceChip(
              label: Text(preset['label']!),
              selected: isSelected,
              onSelected: (_) => onSelectPreset(preset['code']!),
              selectedColor: AppColors.primary,
              backgroundColor: AppColors.surfaceElevated,
              labelStyle: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.textSecondaryDark,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
