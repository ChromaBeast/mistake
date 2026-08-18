import 'package:flutter/material.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../models/document_scan.dart';
import 'add_page_button.dart';
import 'page_thumbnail_card.dart';

class PageThumbnailTray extends StatelessWidget {
  final List<ScannedPage> pages;
  final ValueChanged<String> onRemovePage;
  final VoidCallback onAddPage;

  const PageThumbnailTray({
    super.key,
    required this.pages,
    required this.onRemovePage,
    required this.onAddPage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 96,
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.p16,
        vertical: AppDimensions.p8,
      ),
      color: Colors.black.withValues(alpha: 0.8),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: pages.length + 1,
        separatorBuilder: (_, __) => const SizedBox(width: AppDimensions.p12),
        itemBuilder: (context, index) {
          if (index == pages.length) {
            return AddPageButton(onTap: onAddPage);
          }
          final page = pages[index];
          return PageThumbnailCard(
            page: page,
            onRemove: () => onRemovePage(page.id),
          );
        },
      ),
    );
  }
}
