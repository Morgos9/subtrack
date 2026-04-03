# SubTrack Roadmap v1.0

Strategic roadmap for SubTrack — evolving from a polished UI demo into a professional, data-driven subscription intelligence platform.

> **Status key:** ✅ Done · 🚧 In Progress · ❌ Not Started  
> **Last updated:** 2026-04-03

---

## 🏗️ Phase 0 — Foundation & Safety

*Goal: Make the codebase stable, typed, and scalable.*

| Status | Task | Notes |
|--------|------|-------|
| ❌ | **TypeScript Migration** — convert all `.js`/`.jsx` to `.ts`/`.tsx` | Currently all JSX; no tsconfig |
| ❌ | **Global State Management** — introduce Zustand for subscription data | Custom `workspaceStore.js` works but not scalable |
| ✅ | **Data Schema Definition** — central Subscription interface | Defined in `src/data/subscriptions.js` |
| ❌ | **Testing Setup** — Vitest for core calculation logic | `tests/` directory exists, no runner configured |

---

## 💾 Phase 1 — Core Functionality

*Goal: Full usability with local data persistence.*

| Status | Task | Notes |
|--------|------|-------|
| ✅ | **Persistence Layer** — `useLocalStorage` / workspace store | `src/utils/workspaceStore.js` fully implemented |
| ✅ | **Edit Modal** — edit existing subscriptions via modal | `src/components/SubscriptionModal.jsx` |
| ✅ | **Pause Function** — temporarily deactivate subscriptions | `status: 'paused'` implemented; paused cost tracked |
| ✅ | **Smart Billing Logic** — weekly / monthly / quarterly / yearly | `BILLING_OPTIONS` in `SubscriptionModal.jsx` |
| ✅ | **Price Lookup** — curated DB with 40+ services (EUR), fuzzy matching | `src/utils/priceLookup.js` |
| ❌ | **I18n & Currency** — select currency (€, $, £, CHF) and date format | EUR only; no locale switching |

---

## 🎨 Phase 2 — UI/UX Refinement

*Goal: State-of-the-art dashboard experience (Bento look).*

| Status | Task | Notes |
|--------|------|-------|
| ❌ | **Bento-Grid Layout** — modular card tile system | Current layout is column-based, not full Bento |
| 🚧 | **Glassmorphism 2.0** — Tailwind 4 backdrop-blur on cards and sidebars | Grundstruktur vorhanden, aber visuell nicht konsistent — muss sauber neu aufgesetzt werden |
| ✅ | **Theme System** — 5 color presets, persisted via localStorage | Forest, Midnight, Ocean, Ember, Lavender |
| 🚧 | **Responsive Design** — full overhaul across all breakpoints | Vorhanden, aber noch nicht ausreichend — Layout auf Tablet/Mobile bricht in Teilen, muss ordentlich neu aufgesetzt werden |
| ✅ | **Dark Mode Excellence** — well-calibrated contrast for night mode | All 5 themes are dark-first |
| ❌ | **Micro-Interactions** — Framer Motion list animations | No animation library installed |
| ❌ | **Swipe-to-Delete** — gesture support on mobile | Not implemented |
| ❌ | **Empty State** — motivating onboarding screen for new users | No empty state handling |

---

## 📊 Phase 3 — Intelligence & Analytics

*Goal: Show users where their money really goes.*

| Status | Task | Notes |
|--------|------|-------|
| ❌ | **Burn-Rate Dashboard** — real monthly cost with yearly subs amortised | Only raw sum shown; no amortisation |
| ❌ | **Area Charts** — 12-month spend trend as area chart | `LineChart.jsx` exists (SVG line only) |
| ✅ | **Category Donut** — streaming vs fitness vs software breakdown | `src/components/DonutChart.jsx` |
| ✅ | **Spend History Bar** — monthly spend visualisation | `src/components/BarChart.jsx` |
| ❌ | **Trial Tracker** — warning badge for free trials with expiry date | Not implemented |
| ❌ | **Price History** — log price increases per provider | Not implemented |

---

## ☁️ Phase 4 — Connectivity & Automation

*Goal: Cloud sync and automation.*

| Status | Task | Notes |
|--------|------|-------|
| ❌ | **Supabase Auth** — email/Google login | No backend |
| ❌ | **Realtime DB Sync** — multi-device via Supabase | No backend |
| ❌ | **Logo API** — auto-fetch company logos (Clearbit/Brandfetch) | Emoji icons only |
| ❌ | **PWA Support** — installable as standalone app | No service worker / manifest |
| ❌ | **CSV Import/Export** — parse bank exports (PayPal/Revolut) | Not implemented |

---

## 🌟 Phase 5 — Power-User Features

*Goal: Unique features for maximum savings.*

| Status | Task | Notes |
|--------|------|-------|
| ❌ | **Shared Subscriptions** — cost-splitting tool ("who owes me what?") | Not implemented |
| ❌ | **Cancellation Assistant** — generate PDF cancellation letter from app | Not implemented |
| ❌ | **Savings Coach** — AI-based suggestions ("You have 3 music services") | Not implemented |
| ❌ | **Bank Sync (PSD2)** — optional read-only account access | Not implemented |

---

## 🎨 UI Design Specification

For AI editors (Codex / Cursor / Copilot):

| Property | Value |
|----------|-------|
| Framework | React 19 + Tailwind CSS 4 |
| Components | Radix UI (accessibility) |
| Primary accent | `#10b981` (Emerald Green) |
| Background | `#0f172a` (Slate-900) |
| Surface | `rgba(255, 255, 255, 0.05)` + `backdrop-blur` |
| Animation duration | `200ms` |
| Easing | `ease-out` |

---

## 📅 Implementation Order (for AI agents)

Recommended sequence based on dependencies and impact:

1. **Phase 2** → Glassmorphism 2.0 & Responsive Design — sauber neu aufsetzen (höchste Priorität)
2. **Phase 0** → Vitest setup (isolated, no breaking changes)
3. **Phase 1** → Currency/locale selection
4. **Phase 2** → Empty states + Framer Motion animations
5. **Phase 2** → Swipe-to-delete (mobile)
6. **Phase 3** → Burn-rate calculation + Area chart
7. **Phase 3** → Trial tracker
8. **Phase 0** → TypeScript migration (after features stabilise)
9. **Phase 0** → Zustand migration (after TS)
10. **Phase 4** → PWA support
11. **Phase 4** → CSV import/export
