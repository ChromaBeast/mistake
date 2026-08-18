## 2026-08-18T07:57:21Z
Implement the complete Flutter Mobile application in `mobile/`:
1. `pubspec.yaml`, `analysis_options.yaml`.
2. Core Layer (`lib/core/`): Constants (endpoints, app colors, dimensions, typography), Theme (dark/light), Network client, Sync queue notifier & offline status provider, Formatters (`currency_formatter.dart` for paise INR, `date_formatter.dart`).
3. Shared Components (`lib/shared/`): Reusable UI atoms (AppButton, AppBadge, AppCard, AppHeader, AppTextField, FinancialMetricChip, NetworkIndicatorBanner, PushNotificationToast, SeverityIndicatorPill, BottomNavBar).
4. Domain Models (`lib/models/`): DocumentScan, InspectionItem, MistakeItem, NotificationItem, UserSession.
5. Features (`lib/features/`):
   - Auth (`features/auth/`): Login screen, auth provider with RBAC roles.
   - Dashboard (`features/dashboard/`): KPI cards, protected vs leakage metrics, discrepancy alerts feed, quick action launcher grid.
   - Factory Floor Document Capture (`features/document_capture/`): Multi-page camera scanner simulation, custom edge detection overlay painter, ambient lighting lux meter & glare badge, page thumbnail tray, batch upload progress sheet with 5-stage progression.
   - Barcode / QR Floor Inspection (`features/barcode_inspection/`): Viewfinder laser line animated scanner overlay, quick scan presets (GST E-way, PO QR, Invoice Barcode), side-by-side discrepancy preview card (Ordered vs Received, ₹ variance), inspection actions toolbar (Flag, Accept, Escalate, Photo Attach).
   - Executive Triage (`features/triage/`): Swipeable discrepancy card deck (Swipe right: Verify, Left: Dismiss, Up: Escalate), mandatory dismiss reason bottom sheet, resolve signoff modal, live INR tally in paise.
   - Notifications (`features/notifications/`): Alert list, interactive push notification alert simulator with deep linking to discrepancy cards.
   - Settings & Sync (`features/settings/`): Connectivity simulator toggle (Online / Poor 2G / Offline), offline queue manager & manual sync trigger.
6. Tests (`test/`): Unit and widget tests for currency formatter, sync queue, edge painter, and triage transitions.

Constraints:
- <200 LoC per non-data Dart file (target <150)
- `Color.withValues(alpha: ...)` strictly (zero `withOpacity`)
- Clean `flutter analyze`
- Tests pass (`flutter test`)
- Riverpod state management
