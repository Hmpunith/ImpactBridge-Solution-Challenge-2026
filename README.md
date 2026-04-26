# 🌉 ImpactBridge

> **AI-Powered Volunteer Coordination for Social Impact**
> Solution Challenge 2026 — Team Parsec

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?logo=google-cloud)](https://cloud.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Analytics-FFCA28?logo=firebase)](https://firebase.google.com)

## 🎯 Problem Statement

**[Smart Resource Allocation] Data-Driven Volunteer Coordination for Social Impact**

Local social groups and NGOs collect valuable community data through paper surveys and field reports. However, this data is scattered across different places, making it hard to identify urgent needs. Meanwhile, willing volunteers exist but have no efficient way to find where they're needed most.

## 💡 Solution

ImpactBridge uses **Google Gemini AI** to:

1. **Parse** unstructured community data (surveys, reports, notes) into structured, prioritized needs
2. **Match** available volunteers to needs based on skills, location, and urgency
3. **Track** social impact with AI-generated analysis reports

## 🏗️ Architecture

```
Client (React SPA)          →   Express API (Cloud Run)
├── Needs Dashboard               ├── /api/extract-needs   → Gemini AI
├── AI Data Parser                 ├── /api/match-volunteers → Gemini AI
├── Volunteer Registry             ├── /api/impact-report    → Gemini AI
├── AI Smart Matching              └── /api/health
└── Impact Tracker

Google Services:
├── Gemini 2.5 Flash    — AI for data parsing + volunteer matching
├── Cloud Run           — Containerized deployment
├── Cloud Logging       — Server observability
├── Firebase Firestore  — Needs + volunteer persistence
├── Firebase Auth       — Google Sign-In
├── Firebase Analytics  — User engagement tracking
├── Google Maps API     — Location-based visualization
└── Google Fonts        — Typography (Inter)
```

## 🚀 Quick Start

```bash
# Install
npm install

# Development (runs both client + server)
npm run dev

# Tests
npm test

# Build
npm run build

# Production
npm start
```

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Express.js 5 |
| AI | Google Gemini 2.5 Flash |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google OAuth) |
| Analytics | Firebase Analytics |
| Hosting | Google Cloud Run (Docker) |
| Logging | Google Cloud Logging |
| Validation | Zod |
| Security | Helmet, CORS, Rate Limiting, XSS |
| Testing | Vitest + Testing Library + Supertest |

## 🧪 Testing

75+ tests across 5 test suites:

```bash
npm test
```

- **Component Tests** — All React components render correctly
- **Accessibility Tests** — WCAG AA: landmarks, ARIA, skip links
- **Schema Tests** — Zod validation for all AI outputs
- **API Tests** — Endpoint validation + security headers
- **Constants Tests** — Data integrity

## 🔒 Security

- Helmet.js with Content Security Policy
- Permissions-Policy header
- Rate limiting (30 req/min/IP)
- XSS input sanitization
- Request ID tracking (UUID v4)
- Non-root Docker container
- Zod schema validation on all AI outputs

## 👥 Team Parsec

Built for Google Solution Challenge 2026 — Build with AI

## 📄 License

MIT
