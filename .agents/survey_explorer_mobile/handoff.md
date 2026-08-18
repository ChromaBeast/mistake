# Comprehensive Mobile App (Flutter) Specification & Survey Report

**Agent**: `survey_explorer_mobile`  
**Working Directory**: `c:/Users/sheer/Documents/antigravity/proud-curie/.agents/survey_explorer_mobile`  
**Target Platform**: Mobile (Flutter 3.44.2 / Dart 3.12.2)  
**Date**: 2026-08-18  

---

## 1. Observation

Direct observations from the authoritative specification files in `docs/` and `.agents/ORIGINAL_REQUEST.md`:

### 1.1 Mobile Platform Mandate & Positioning
- **`docs/02-architecture/system-architecture.md` (lines 96–103)**:
  > *"## Mobile*
  > *Flutter. Use for factory-floor scenarios: camera capture, barcode/QR scanning, voice notes, push notifications, offline event capture, approvals. Flutter is not intended to replace the primary web investigation experience — it's a capture and approval surface, not a full analyst workbench."*
- **`docs/01-product/PRD.md` (line 6)**:
  > *"**Platforms:** Web (primary), Mobile (secondary)"*
- **`docs/01-product/personas.md`**:
  - **Operations Manager**: *"Which operational problems need attention?"* — Primary experience: Issues, on-floor dispatch/shipment inspection, triage resolution.
  - **Business Owner / Executive**: *"Where are we losing money?"* — Primary experience: High-level financial leakage overview, swipeable triage for high-value decisions.
  - **Analyst / Floor Inspector**: Camera document capture, barcode/QR goods receipt validation, evidence collection.

### 1.2 Data Contracts, Financial Engine, & Money Representation
- **`docs/02-architecture/adr/0002-ai-never-computes-money.md` (lines 12–16)**:
  > *"`mistakes.financial_impact_minor` is written exclusively by deterministic code applying a fixed formula per `mistake_type`. AI may extract the raw quantities/prices that feed the formula, and may explain the result in natural language, but never outputs the number itself."*
- **`docs/02-architecture/data-model.md` (lines 13–15, 248–285, 292–300)**:
  - Money is stored strictly as integer minor units (`BIGINT`, **paise** in INR), never floating point.
  - Mistake types: `quantity_mismatch`, `price_mismatch`, `date_mismatch`, `status_mismatch`, `missing_evidence`.
  - Mistake severities: `critical`, `high`, `medium`, `low`, `healthy`.
  - Mistake statuses: `detected`, `under_review`, `verified`, `resolved`, `unresolved`, `dismissed`.
  - Quantity mismatch formula: `financial_impact_minor = ABS(order_quantity - invoice_quantity) * invoice_unit_price_minor`.
  - Status transitions: Transitioning to `dismissed` or `resolved` requires a mandatory recorded `reason`.

### 1.3 Ingestion Progression & Event Life Cycle
- **`docs/01-product/acceptance-criteria.md` (lines 54–56)**:
  > *"processing status moves through `Queued → Processing → Extracting → Analyzing → Completed/Failed` and is visible at every stage"*
- **`docs/02-architecture/event-model.md` (lines 33–54)**:
  - Events: `order.created`, `order.quantity.changed`, `order.price.changed`, `purchase_order.created`, `invoice.created`, `payment.created`, `shipment.created`, `document.uploaded`, `document.processed`, `mistake.detected`, `mistake.verified`, `mistake.dismissed`, `mistake.resolved`.

### 1.4 REST API Surface for Mobile Integration
- **`docs/02-architecture/api-spec.md` (lines 11–25, 26–116)**:
  - Base path: `/api/v1`
  - Authentication: `Authorization: Bearer <session token>`
  - Document Upload: `POST /data-sources`, `GET /data-sources/:id`
  - Mistakes: `GET /mistakes`, `GET /mistakes/:id`, `PATCH /mistakes/:id/status`, `PATCH /mistakes/:id/assign`, `GET /dashboard/summary`
  - Notifications: `GET /notifications`, `PATCH /notifications/:id/read`
  - Search: `GET /search?q=`

### 1.5 Strict User Rules & Code Quality Constraints
- **Rule 1**: Flutter widgets must be factored into granular, reusable components.
- **Rule 2**: Strictly use `Color.withValues(alpha: ...)` instead of deprecated `withOpacity(...)`.
- **Rule 3**: Every non-data/non-json source file across Dart must remain strictly readable and under 200 lines of code (<200 LoC). Target <150 LoC per file.
- **Rule 4**: Riverpod state management (`flutter_riverpod`, `riverpod_annotation`, `riverpod_generator`, `build_runner`).
- **Rule 5**: Clean `flutter analyze` with zero warnings and zero errors.

---

## 2. Logic Chain

1. **Role Specialization**: Since mobile is explicitly a *capture and approval surface* (not an analyst workbench), the UI must be optimized for fast touch interactions on the factory floor and executive triage on the go.
2. **Factory Floor Capture Pipeline**:
   - In industrial warehouse/factory environments, poor lighting and document skew are frequent. Therefore, a multi-page camera scanner simulation must feature:
     * Real-time edge detection quad overlay (simulated computer vision perspective guide).
     * Ambient lighting indicator meter (Lux quality sensor: Too Dark / Optimal / Glare warning).
     * Multi-page thumbnail tray (reorder, delete, add page).
     * Document batch compilation with metadata tagging (Type, PO #, Notes).
     * Asynchronous background upload queue with visual stage progression (`Queued → Uploading → Extracting → Analyzing → Completed`).
3. **Barcode / QR Code Fast Inspection**:
   - Incoming shipments and dispatch boxes have barcodes/QR codes (GST E-way bills, PO QR tags, dispatch barcodes).
   - Scanning a code must trigger an instantaneous mock/live lookup against backend entity records.
   - The UI must immediately display a discrepancy alert card (e.g. Ordered: 5,000 units vs Dispatched: 4,500 units, variance ₹22,500.00).
   - Fast action buttons (`[Flag Discrepancy]`, `[Accept Shipment]`, `[Request Supervisor Signoff]`, `[Attach Photo Evidence]`).
4. **Executive & Manager Triage Mode**:
   - Executives need rapid decision-making on high-severity leaks without navigating complex tables.
   - A gesture-driven swipeable card deck (Swipe right to Approve/Verify, Swipe left to Dismiss with mandatory reason, Swipe up to Escalate) provides an efficient workflow.
   - Live push alert simulator to demonstrate high-severity leakage alerts with direct deep-linking into the triage card.
   - Real-time financial summary widget computing INR amounts in paise minor units (`₹XX,XX,XXX.XX`).
5. **Offline-First Resilience**:
   - Factory floors and metal basements frequently have zero or intermittent connectivity.
   - All captured documents and triage decisions must be cached in a local sync queue.
   - An interactive network status simulator (Online / Poor 2G / Offline) paired with a persistent top sync indicator banner ensures full transparency and automatic sync upon reconnection.
6. **Architectural Modularization (<200 LoC Rule)**:
   - To strictly obey the <200 LoC constraint without sacrificing rich functionality, each feature is decomposed into atomic files: dedicated models, isolated Riverpod notifiers, independent painters/overlays, and modular sub-widgets.

---

## 3. Caveats

1. **Hardware Camera / Sensor Simulation**: In development/testing environments without physical mobile cameras or lux hardware sensors, camera frames, edge detection polygons, barcode scanning lasers, and lighting meters are simulated via high-fidelity reactive widgets and test fixtures.
2. **Deterministic Financial Computations**: All currency values are strictly calculated in paise (minor units) on device using integer arithmetic, formatted with the Indian numbering system (`₹1,50,000.00`), ensuring 100% adherence to ADR-0002.
3. **Riverpod Generation Setup**: When using Riverpod, state can be structured using functional/class notifiers or `@riverpod` annotations, with robust fallbacks ensuring instant compilation without build runner bottlenecks.

---

## 4. Conclusion & Complete Specification Blueprint

### 4.1 Features Discovered & Mapped

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Document Capture | Multi-Page Camera Scanner | Interactive camera viewfinder simulating page captures with shutter, flash, and page tray | Shutter tap, flash toggle, doc type | Ordered list of captured page images/metadata | Empty capture validation alert | `system-architecture.md`, Request |
| 2 | Document Capture | Edge Detection Overlay | Animated quadrilateral polygon overlay showing detected document corners and perspective guide | Video frame / aspect ratio | Visual bounding box coordinates (quad) | "Hold still" warning on misaligned bounds | `system-architecture.md`, Request |
| 3 | Document Capture | Lighting Quality Indicator | Ambient lux meter displaying lighting health (Too Dark / Good / Glare) | Simulated ambient lux value (0–1000 lx) | Lighting status pill, flash recommendation | Warning badge if lux < 150 lx | `system-architecture.md`, Request |
| 4 | Document Capture | Batch Upload Pipeline | Multi-page document compilation and upload queue with progression stages | Page bundle, doc type, PO reference | Asynchronous upload item with progress bar (0-100%) | Retry button on simulated upload failure | `data-model.md`, `acceptance-criteria.md` |
| 5 | Barcode / QR | Viewfinder Scanner Simulation | Laser line scanning animation with quick presets (GST E-way, PO QR, Invoice Barcode) | Preset tap or manual code input | Parsed barcode string & metadata | "Unrecognized Barcode Format" notice | `system-architecture.md`, Request |
| 6 | Barcode / QR | Instant Discrepancy Preview | Real-time cross-match of scanned item against purchase orders/invoices | Barcode payload (PO/Invoice ID) | Side-by-side comparison card (Expected vs Received, ₹ variance) | Missing record fallback state | `data-model.md`, Request |
| 7 | Barcode / QR | Floor Quick Actions | Contextual action buttons for floor managers (Flag, Accept, Escalate, Photo Attach) | Action button tap | Discrepancy event logged, state updated | Confirmation dialog before escalation | `system-architecture.md`, Request |
| 8 | Executive Triage | Swipeable Discrepancy Cards | Gesture-driven card deck for executive review (Swipe right: Verify, left: Dismiss, up: Escalate) | Drag gestures, button clicks | Card transition animation, state transition | Undo snackbar on accidental swipe | `personas.md`, Request |
| 9 | Executive Triage | Mandatory Reason Bottom Sheet | Modal sheet enforcing reason selection upon dismissing or resolving a Mistake | Selected reason enum + optional notes | Validated `mistake_transitions` payload | Submit disabled until reason selected | `data-model.md`, `acceptance-criteria.md` |
| 10 | Executive Triage | Push Notification Simulator | Interactive generator simulating high-severity discrepancy push alerts with deep link | Trigger alert action | System notification toast & badge increment | Queue alert if app is backgrounded | `system-architecture.md`, Request |
| 11 | Financial Engine | Minor Unit Paise Formatter | Deterministic conversion of integer paise to Indian Rupee format (`₹XX,XX,XXX.XX`) | Integer minor units (e.g. `2250000`) | Formatted string (e.g. `₹22,500.00`) | NaN / negative safe formatting | `ADR-0002`, `data-model.md` |
| 12 | Offline & Sync | Local Cache & Sync Queue | Repository holding pending uploads, offline triage reviews, and cached findings | Offline action events | Local storage queue, sync status | Sync error state with manual retry | `system-architecture.md`, Request |
| 13 | Offline & Sync | Network Connectivity Simulator | Toggle between Online (4G/WiFi), Poor Signal (2G), and Offline modes | Network selector toggle | App-wide connectivity state broadcast | Offline notification banner display | `system-architecture.md`, Request |
| 14 | Offline & Sync | Sync Status Indicator Banner | Top persistent status bar showing synced items, queued count, and syncing progress | Sync queue stream | Real-time animated status pill | Error badge with tap-to-retry | `acceptance-criteria.md`, Request |

---

### 4.2 Edge Cases

| # | Feature | Input | Observed / Specified Behavior |
|---|---------|-------|-------------------------------|
| 1 | Multi-Page Scanner | User attempts to submit with 0 pages captured | Action disabled; instructional toast "Capture at least one page before proceeding" shown. |
| 2 | Camera Scanner | Low ambient light (<100 lux) detected | Lighting badge turns Amber with text "Too Dark — Tap torch icon to illuminate". |
| 3 | Barcode Scanner | Scanned QR code not in local database | Displays "Unrecognized Shipment Code" with option to manually attach to a new PO. |
| 4 | Executive Triage | User swipes left to Dismiss without selecting a reason | Bottom sheet blocks completion until one of the valid reasons is selected. |
| 5 | Executive Triage | Discrepancy with 0 financial impact (`null` or `0` paise) | Hides financial impact pill, shows "Non-Financial Mismatch (Date/Status)". |
| 6 | Offline Sync | Device goes offline mid-upload | Upload is paused, status marked "Queued Offline", auto-resumes once connection is restored. |
| 7 | Offline Triage | 5 decisions made while offline | Local UI updates immediately (optimistic UI); decisions sync sequentially upon reconnect. |
| 8 | Currency Formatting | Value of ₹1,45,230.50 represented as `14523050` paise | Formats precisely as `₹1,45,230.50` following the Indian numbering system. |
| 9 | Push Notification | User taps notification banner for resolved Mistake | Navigates to Mistake detail, shows "Status: Resolved" with complete audit transition log. |
| 10 | Color Transparency | Any widget requiring background tint | Uses `Color.withValues(alpha: 0.12)` strictly, never `withOpacity`. |

---

### 4.3 Target Folder & File Layout (<200 LoC Compliance)

```
mobile/
├── pubspec.yaml
├── analysis_options.yaml
├── lib/
│   ├── main.dart                               (<100 LoC) - Entry point & ProviderScope
│   ├── app.dart                                (<80 LoC)  - MaterialApp & Theme config
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_endpoints.dart              (<50 LoC)  - REST route constants
│   │   │   ├── app_colors.dart                 (<90 LoC)  - Slate/Emerald/Amber/Rose palette
│   │   │   ├── app_dimensions.dart             (<60 LoC)  - Padding, radius, icon sizes
│   │   │   └── app_typography.dart             (<70 LoC)  - Text styles & font hierarchy
│   │   ├── network/
│   │   │   ├── api_client.dart                 (<120 LoC) - HTTP & mock API client
│   │   │   └── network_status_provider.dart    (<90 LoC)  - Network connectivity state
│   │   ├── sync/
│   │   │   ├── sync_queue_item.dart            (<80 LoC)  - Offline queue data model
│   │   │   ├── sync_queue_notifier.dart        (<140 LoC) - Offline sync manager
│   │   │   └── sync_status_provider.dart       (<70 LoC)  - Sync status stream provider
│   │   ├── theme/
│   │   │   ├── app_theme.dart                  (<110 LoC) - Dark & Light ThemeData
│   │   │   └── theme_mode_provider.dart        (<50 LoC)  - Theme toggle state
│   │   └── utils/
│   │       ├── currency_formatter.dart         (<80 LoC)  - Indian Rupee paise formatter
│   │       └── date_formatter.dart             (<60 LoC)  - Relative time & date parser
│   ├── shared/
│   │   ├── components/
│   │   │   ├── app_badge.dart                  (<70 LoC)  - Generic status badge
│   │   │   ├── app_button.dart                 (<80 LoC)  - Primary/Secondary/Outline button
│   │   │   ├── app_card.dart                   (<60 LoC)  - Container card with border
│   │   │   ├── app_header.dart                 (<70 LoC)  - Top navigation bar widget
│   │   │   ├── app_text_field.dart             (<80 LoC)  - Styled input field
│   │   │   ├── financial_metric_chip.dart      (<80 LoC)  - INR currency chip
│   │   │   ├── network_indicator_banner.dart   (<90 LoC)  - Offline/Sync top banner
│   │   │   ├── push_notification_toast.dart    (<110 LoC) - In-app banner alert toast
│   │   │   └── severity_indicator_pill.dart    (<70 LoC)  - Severity color pill
│   │   └── navigation/
│   │       ├── bottom_nav_bar.dart             (<90 LoC)  - Bottom navigation bar
│   │       └── navigation_provider.dart        (<60 LoC)  - Current screen index notifier
│   ├── models/
│   │   ├── document_scan.dart                  (<90 LoC)  - Scanned page & doc metadata
│   │   ├── inspection_item.dart                (<110 LoC) - Scanned barcode/QR item
│   │   ├── mistake_item.dart                   (<130 LoC) - Discrepancy & financial model
│   │   ├── notification_item.dart              (<80 LoC)  - Push notification alert model
│   │   └── user_session.dart                   (<60 LoC)  - User role & tenant model
│   └── features/
│       ├── auth/
│       │   ├── providers/auth_provider.dart    (<120 LoC) - Login & RBAC session provider
│       │   └── screens/login_screen.dart       (<140 LoC) - B2B credentials & demo login
│       ├── dashboard/
│       │   ├── providers/dashboard_provider.dart (<110 LoC) - KPI & summary metrics
│       │   ├── widgets/financial_kpi_card.dart (<90 LoC)  - Protected vs Leakage card
│       │   ├── widgets/recent_alerts_list.dart (<100 LoC) - Discrepancy feed list
│       │   ├── widgets/quick_action_grid.dart  (<90 LoC)  - Camera/Scan/Triage launcher
│       │   └── screens/dashboard_screen.dart   (<130 LoC) - Main mobile dashboard
│       ├── document_capture/
│       │   ├── providers/capture_provider.dart (<140 LoC) - Multi-page capture state
│       │   ├── widgets/camera_viewfinder.dart  (<120 LoC) - Viewfinder & shutter
│       │   ├── widgets/edge_overlay_painter.dart (<110 LoC) - Bounding box quad painter
│       │   ├── widgets/lighting_indicator.dart (<90 LoC)  - Lux meter & glare badge
│       │   ├── widgets/page_thumbnail_tray.dart (<110 LoC) - Bottom page thumbnail list
│       │   ├── widgets/upload_progress_sheet.dart (<130 LoC) - Stage progression modal
│       │   └── screens/camera_scanner_screen.dart (<140 LoC) - Full camera scanner screen
│       ├── barcode_inspection/
│       │   ├── providers/inspection_provider.dart (<130 LoC) - Inspection lookup provider
│       │   ├── widgets/laser_scanner_overlay.dart (<110 LoC) - Animated laser line
│       │   ├── widgets/scan_preset_selector.dart  (<100 LoC) - Sample barcode picker
│       │   ├── widgets/discrepancy_preview_card.dart (<140 LoC) - PO vs Invoice match card
│       │   ├── widgets/inspection_actions_bar.dart (<100 LoC) - Action button toolbar
│       │   └── screens/inspection_screen.dart   (<130 LoC) - Barcode inspection screen
│       ├── triage/
│       │   ├── providers/triage_provider.dart  (<140 LoC) - Card deck state & filters
│       │   ├── widgets/triage_card.dart        (<140 LoC) - Single discrepancy card UI
│       │   ├── widgets/triage_card_stack.dart  (<130 LoC) - Swipe gesture card stack
│       │   ├── widgets/triage_action_bar.dart  (<110 LoC) - Verify/Dismiss/Escalate row
│       │   ├── widgets/dismiss_reason_sheet.dart (<130 LoC) - Mandatory reason selector
│       │   ├── widgets/resolve_modal.dart      (<120 LoC) - Resolution signoff modal
│       │   └── screens/triage_screen.dart      (<130 LoC) - Executive triage screen
│       ├── notifications/
│       │   ├── providers/notification_provider.dart (<120 LoC) - Alert manager & push simulator
│       │   ├── widgets/notification_list_tile.dart (<110 LoC) - Alert item tile
│       │   └── screens/notification_screen.dart (<120 LoC) - Notification center screen
│       └── settings/
│           ├── providers/settings_provider.dart (<90 LoC) - Offline & demo config
│           └── screens/settings_screen.dart    (<140 LoC) - App settings & sync controls
```

---

### 4.4 Riverpod State Management Architecture

```
                       ┌─────────────────────────┐
                       │      ProviderScope      │
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  networkStatusProv.  │ │   syncQueueNotifier  │ │     authProvider     │
│ (Online/2G/Offline)  │ │ (Queued, Replaying)  │ │ (Owner/Mgr/Analyst)  │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│captureProvider│           │inspectionProv.│           │ triageProvider│
│- Page list    │           │- Barcode query│           │- Card stack   │
│- Lux meter    │           │- Mismatch data│           │- Swipes/filter│
│- Upload queue │           │- Actions log  │           │- INR tally    │
└───────────────┘           └───────────────┘           └───────────────┘
```

---

## 5. Verification Method

To independently verify all mobile specifications, constraints, and implementations:

1. **Static Analysis & Lint Verification**:
   ```powershell
   cd mobile
   flutter pub get
   flutter analyze
   ```
   *Expectation*: Zero errors, zero warnings.
2. **Line Count Constraint Check**:
   ```powershell
   Get-ChildItem -Path mobile/lib -Recurse -Filter *.dart | ForEach-Object {
       $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
       if ($lines -ge 200) {
           Write-Error "$($_.FullName) exceeds 200 lines: $lines lines"
       }
   }
   ```
   *Expectation*: 100% of Dart files are strictly < 200 LoC.
3. **Deprecation Audit (`withOpacity` check)**:
   ```powershell
   Get-ChildItem -Path mobile/lib -Recurse -Filter *.dart | Select-String "withOpacity"
   ```
   *Expectation*: Zero matches found. All color alpha modifications strictly use `Color.withValues(alpha: ...)`.
4. **Widget and Unit Tests**:
   ```powershell
   flutter test
   ```
   *Expectation*: All unit and widget test cases pass covering currency formatting, sync queue replay, edge detection painting, and triage swipe transitions.
