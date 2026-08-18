# Mistake 🔍

> **Evidence-backed B2B financial leakage and discrepancy detection platform** designed for manufacturers, distributors, and wholesalers (India-first, INR currency in paise minor units).

---

## 🏗️ Repository Architecture

The project is organized as a three-tier architecture in `projects/mistake`:

```
projects/mistake/
├── backend/            # Modular monolith in Go 1.26 (REST API, Ingestion Pipeline, 5 Detection Engines)
├── web/                # Next.js 16 (Turbopack) & React 19 B2B Investigation Workspace
├── mobile/             # Flutter 3.44+ Factory Floor Scanner, Barcode QC & Executive Triage
├── e2e/                # Comprehensive 4-Tier integration and opaque-box test suites
├── docs/               # Architecture Decision Records (ADRs) and domain specifications
├── docker-compose.yml  # Multi-container local orchestration configuration
├── render.yaml         # 1-Click Render.com Blueprint (Go + Postgres + Next.js)
└── .env.example        # Environment variables template
```

---

## ⚡ Features & Capabilities

- **Deterministic Discrepancy Detection**: 5 independent detection engines (Quantity variance, Master rate/Price mismatch, SLA Delivery date breach, Status lifecycle contradictions, Missing/Orphan evidence).
- **Exact Paise Arithmetic (ADR-0002)**: Complete integer math in paise minor units to eliminate IEEE-754 floating-point rounding errors.
- **5-Stage Ingestion Pipeline**: Async state machine (`Queued ➔ Processing ➔ Extracting ➔ Analyzing ➔ Completed`) with SHA-256 deduplication cache.
- **Fuzzy Entity Resolution**: Jaro-Winkler/Levenshtein matching, Human Review Queue, and temporal event sourcing.
- **Enterprise Security**: 15-minute JWT Access Tokens + 7-day Rotated Refresh Tokens, TOTP 2FA, 5-tier RBAC, and HttpOnly cookie BFF proxy.
- **Factory Floor Mobile**: Document camera scanner with lux metering, laser barcode simulation, and offline-first sync queue.

---

## 🚀 Quick Start (Local Testing)

### Option 1: Docker Compose (Full Stack in 1 Command)

```bash
# Clone and navigate to project directory
cd projects/mistake

# Build and start all services
docker compose up --build
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Go API & Health**: [http://localhost:8080/health](http://localhost:8080/health)

---

### Option 2: Native Development Servers

#### 1. Backend (Go 1.26)
```bash
cd backend
go run ./cmd/server
# API listening at http://localhost:8080
```

#### 2. Web (Next.js 16 & React 19)
```bash
cd web
npm install
npm run dev
# Dashboard at http://localhost:3000
```

#### 3. Mobile (Flutter 3.44+)
```bash
cd mobile
flutter run -d chrome     # Run in browser
# or
flutter run -d android    # Run on connected Android device/emulator
```

---

## 🧪 Running Automated Tests

```bash
# 1. Backend Tests (13 test suites)
cd backend && go test -v ./test/...

# 2. Web Unit & Contract Tests (14 Vitest tests + TSC check)
cd web && npx vitest run && npx tsc --noEmit

# 3. Mobile Tests & Lints (28 Flutter tests + analyze)
cd mobile && flutter test && flutter analyze
```

---

## ☁️ All-in-One Cloud Deployment (Render.com)

The entire full-stack platform (Go REST API + Next.js Web Dashboard + Managed PostgreSQL) is pre-configured to deploy together on [Render.com](https://render.com) using the included [`render.yaml`](render.yaml) Blueprint:

1. Log into **[dashboard.render.com](https://dashboard.render.com)**.
2. Click **New +** ➔ **Blueprint**.
3. Select your repository.
4. Render will read [`render.yaml`](render.yaml) and deploy:
   - 🗄️ **`mistake-db`** — Free Managed PostgreSQL Database
   - ⚙️ **`mistake-backend`** — Go 1.26 REST API Docker Service
   - 🌐 **`mistake-web`** — Next.js 16 Web Dashboard Docker Service
5. Click **Apply**.

---

## 📱 Mobile Distribution (Flutter)

- **Android Standalone APK**: `cd mobile && flutter build apk --release --split-per-abi` (distribute via GitHub Releases)
- **Google Play Bundle**: `cd mobile && flutter build appbundle --release`
- **iOS IPA**: `cd mobile && flutter build ipa --release`
