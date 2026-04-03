# Phase 2 — Implementierungsplan

## 1. Glassmorphism-Analyse (Ist-Zustand)

### Gefundene Probleme

**a) `panel-card` — kein echtes Glassmorphism**
```css
/* IST (index.css Z. 257-265) */
.panel-card {
  background: linear-gradient(180deg, rgba(20, 27, 23, 0.96) 0%, rgba(14, 19, 16, 0.98) 100%);
  backdrop-filter: blur(18px);
}
```
- `backdrop-filter` ist gesetzt, aber der Hintergrund hat Opacity `0.96–0.98` — faktisch opak.
  Echtes Glassmorphism braucht `background` mit Opacity `0.04–0.12`.
- Kein `-webkit-backdrop-filter` (Safari bricht).
- Kein `saturate()` im `backdrop-filter` — flaches Aussehen.

**b) `hero-stat`, `modal-section`, `modal-sidebar-card` — kein `backdrop-filter`**
```css
/* IST */
.hero-stat { background: rgba(255,255,255,0.025); }  /* kein backdrop-filter */
.modal-section { background: rgba(255,255,255,0.025); }  /* kein backdrop-filter */
```

**c) `dashboard-sidebar` — kein Glassmorphism-Background**
```css
/* IST */
.dashboard-sidebar { border-right: 1px solid var(--border); }
/* background fehlt komplett — erbt body-Hintergrund */
```

**d) `modal-shell` — zu opak**
```css
/* IST */
.modal-shell {
  background: linear-gradient(180deg, rgba(16,22,18,0.98) 0%, rgba(12,17,14,0.99) 100%);
  /* 0.98 / 0.99 = komplett opak, kein Glas-Effekt */
}
```

**e) Header (`App.jsx` Z. 692-695) — inline-style, fehlt `-webkit-backdrop-filter`**
```jsx
style={{
  background: 'var(--header-bg)',
  backdropFilter: 'blur(18px)',  /* kein saturate, kein -webkit */
}}
```

**f) `--bg-elevated`, `--surface`, `--surface-2`, `--surface-3` — alle mit 0.88–0.96**
  Die CSS-Tokens selbst sind zu opak für echtes Glassmorphism.
  Neue Glass-Tokens werden ergänzt.

### Glassmorphism 2.0 — Ziel-Architektur

```
Layer 0: body — dunkler Radial-Gradient-Hintergrund (bleibt)
Layer 1: .dashboard-sidebar — Glass mit blur(20px) saturate(160%), rgba(*, 0.06–0.10)
Layer 2: .panel-card — Glass mit blur(12px) saturate(180%), rgba(*, 0.04–0.08)
Layer 3: .hero-stat / .modal-section — leichtes Glass rgba(255,255,255,0.03–0.05)
Layer 4: .modal-backdrop — blur(16px) saturate(140%) für Overlay
```

---

## 2. Responsive Design — Analyse (Ist-Zustand)

### Gefundene Probleme

**a) Mobile (375px) — `focus-list-row` Text-Overflow**
```css
/* IST */
.focus-list-row p { max-width: 14rem; text-align: right; }
/* Bei 375px kein Platz für 14rem rechtsbündig — überlappt */
```
Fix: `max-width: none; text-align: left;` bei `max-width: 640px`

**b) Mobile — Dashboard-Header doppelt gestapelt**
In `App.jsx` Z. 698:
```jsx
<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
```
- Auf Mobile stapeln sich `Title` + `Action-Buttons` vertikal — Buttons sind am Anfang.
- Die Reihenfolge ist: Titel (oben), dann Buttons — passt, aber Action-Buttons sprengen bei 375px den Container weil kein `flex-wrap` auf dem Button-Container.

Fix: `flex-wrap items-start` auf den Button-Container

**c) Tablet (768px) — Hero-Panel Grid bricht**
```jsx
<div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
```
- `minmax(320px,0.85fr)` auf einem 768px-Viewport = zweite Spalte zwingt auf mind. 320px,
  erste Spalte bekommt nur `768 - 320 - 24 (gap) = 424px` → zu eng.
- Fix: `md:grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]`

**d) Tablet (768px) — `xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]` ohne md-Fallback**
In `App.jsx` Z. 932, 1181:
```jsx
<div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
```
- Korrekt — zwischen md und xl ist es 1-spaltig. Passt.

**e) Tablet — `xl:grid-cols-3` Panel-Grid ohne md-Fallback**
In `App.jsx` Z. 1031:
```jsx
<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
```
- Bei Tablet (md): 2 Spalten für 3 Panels → drittes Panel wird zu einer breiten Single-Column.
  Das ist eigentlich ok, aber `min-h-[320px]` + stretch = unterschiedliche Höhen.
- Fix: `md:grid-cols-2 xl:grid-cols-3` bleibt, aber letztes Kind bekommt `md:col-span-2 xl:col-span-1` via CSS.

**f) Mobile — Sidebar fehlt Background-Color in `is-open`-State**
```css
/* IST */
.dashboard-sidebar {
  /* kein background gesetzt — transparent über Backdrop */
}
```
Fix: Background-Color explizit setzen.

**g) Mobile — SubscriptionTable horizontal scrollt nicht sauber**
Kein `overflow-x: auto` am Container-Wrapper.

**h) `modal-shell` padding auf Mobile**
```css
@media (max-width: 767px) {
  .modal-shell { padding: 1rem; }  /* bereits vorhanden, ok */
}
```

**i) Fehlende Breakpoint-Tokens in index.css**
Aktuell keine `--breakpoint-*`-Tokens. Tailwind-Breakpoints werden direkt verwendet.
Ausreichend für dieses Projekt — kein Handlungsbedarf.

---

## 3. Konkrete Code-Änderungen

### `src/index.css`

1. **Glass-Tokens** ergänzen in `:root` (alle Themes)
2. **`.panel-card`** — `background` auf echtes Glass reduzieren + `-webkit-backdrop-filter` + `saturate`
3. **`.panel-card--muted`** — gleicher Glass-Background, leicht dunkler
4. **`.dashboard-sidebar`** — Glass-Background + `-webkit-backdrop-filter`
5. **`.hero-stat`** — `backdrop-filter` ergänzen
6. **`.modal-backdrop`** — `-webkit-backdrop-filter` + `saturate`
7. **`.modal-shell`** — Background auf Glass-Level reduzieren
8. **`.modal-section`, `.modal-sidebar-card`** — `backdrop-filter` ergänzen
9. **Mobile Fixes** — `focus-list-row` auf Mobile text-align + max-width
10. **Sidebar Background** explizit setzen in `@media (max-width: 1023px)`

### `src/App.jsx`

1. **Hero-Panel Grid** — `md:grid-cols-1 xl:grid-cols-[...]` (Z. 786)
2. **Header Action-Buttons** — `flex-wrap` (Z. 726)
3. **Inline Header-Style** — `-webkit-backdrop-filter` ergänzen (Z. 692)
4. **Bottom-Panel Grid** — `md:grid-cols-2 xl:grid-cols-3` letztes Kind `md:col-span-2 xl:col-span-1` (Z. 1031)

---

## 4. Test-Checkliste

- [ ] Mobile 375px: Hero-Panel einspaltig, kein Text-Overflow
- [ ] Mobile 375px: Sidebar als Drawer öffnet/schließt korrekt, hat Hintergrund
- [ ] Tablet 768px: Hero-Panel einspaltig, Charts untereinander
- [ ] Desktop 1024px+: Hero-Panel zweispaltig
- [ ] Desktop 1440px+: 3-Spalten-Chart-Grid sichtbar
- [ ] Alle 5 Themes: Glassmorphism sichtbar (dunkler Hintergrund nötig)
- [ ] Safari: `-webkit-backdrop-filter` wirkt
- [ ] Modal: Glassmorphism-Overlay korrekt
- [ ] `prefers-reduced-motion`: keine Transitions
