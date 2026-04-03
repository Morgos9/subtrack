# Codex Review — Phase 2 (SubTrack)
Datum: 2026-04-03

---

## Kritische Fixes (blockieren UX)

### Fix 1: Touch Targets zu klein auf Mobile (`.dashboard-button`)

**Datei:** `src/index.css`

**Problem:**
Im `@media (max-width: 479px)`-Block wird `.dashboard-button` auf `min-height: 2.6rem` (41.6px) heruntergestuft — das liegt 2.4px unter dem WCAG 2.5.5 / Apple-HIG-Minimum von 44px. Der Base-Wert (`min-height: 3rem` = 48px) wäre korrekt; der Override macht ihn accessibility-untauglich.

```css
/* src/index.css — Zeile 948–953 */
@media (max-width: 479px) {
  .dashboard-button {
    min-height: 2.6rem;   /* 41.6px — FAIL, min. 44px */
    padding: 0.6rem 0.875rem;
    font-size: 0.875rem;
  }
}
```

**Lösung:** `min-height` auf `2.75rem` (44px) anheben. Font-Size und Padding können bleiben.

```css
@media (max-width: 479px) {
  .dashboard-button {
    min-height: 2.75rem;  /* 44px — PASS */
    padding: 0.6rem 0.875rem;
    font-size: 0.875rem;
  }
}
```

---

### Fix 2: Modal auf Mobile nicht scrollbar — "Speichern" unerreichbar

**Datei:** `src/index.css`, `src/components/SubscriptionModal.jsx`

**Problem:**
`.modal-backdrop` ist korrekt `position: fixed; inset: 0` — das ist gut. Allerdings hat `.modal-shell` weder `overflow-y: auto` noch eine `max-height`-Begrenzung. Auf Geräten mit kleinem Viewport (z. B. iPhone SE, 667px Höhe) wird das 2-spaltige Modal (`72rem` breit, grid `[1.2fr_320px]`) auf single-column reduziert und wächst über den sichtbaren Bereich hinaus. Da `.modal-shell` keinen eigenen Scroll-Container bildet, scrollt die gesamte Seite hinter dem Backdrop — der "Speichern"-Button ist nicht erreichbar ohne den Backdrop-Scroll.

```css
/* src/index.css — Zeile 789–800 */
.modal-shell {
  width: min(100%, 72rem);
  border: 1px solid var(--border);
  border-radius: 1.75rem;
  background: var(--glass-modal);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow: ...;
  padding: 1.5rem;
  /* FEHLT: overflow-y: auto; max-height: 90vh (oder svh) */
}
```

Der Playwright-Report beschreibt das exakt: User muss scrollen um "Speichern" zu erreichen. Das Backdrop-`overflow: hidden` (implizit durch `inset: 0` ohne eigenen Scroll) bringt die Hintergrundseite mit — das ist der Kern des Bugs.

**Lösung:** `.modal-shell` bekommt `overflow-y: auto` und `max-height: min(90vh, 90svh)`. Der `@media (max-width: 767px)` Block reduziert `padding` bereits auf `1rem` — das passt.

```css
.modal-shell {
  width: min(100%, 72rem);
  max-height: min(90vh, 90svh);   /* NEU */
  overflow-y: auto;               /* NEU */
  border: 1px solid var(--border);
  border-radius: 1.75rem;
  background: var(--glass-modal);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 var(--glass-border);
  padding: 1.5rem;
}
```

Hinweis: `svh` (small viewport height) ist die korrekte Einheit für Mobile-Browser mit dynamischer Browser-Chrome. `min(90vh, 90svh)` liefert das kleinere der beiden Werte und ist damit am sichersten. Fallback via `90vh` für ältere Browser ist gegeben.

---

## Minor Issues

### M1: `.dashboard-pill` Touch Target — kein interaktiver Kontext, kein Bug

**Datei:** `src/index.css`, `src/App.jsx`

`.dashboard-pill` hat `min-height: 2rem` (32px). Die Pills werden ausschließlich als `<span>` (dekorativ, nicht interaktiv) gerendert — nie als `<button>`. Kein Touch-Target-Problem. Der Playwright-Test hatte hier einen false positive.

### M2: `.dashboard-filter` — 40px, grenzwertig

**Datei:** `src/index.css` Zeile 454–468

`.dashboard-filter` hat `min-height: 2.5rem` (40px). Diese Filter-Buttons sind interaktiv (`type="button"` in App.jsx Zeile 1134). 40px liegt unter dem 44px-Minimum. Geringer Schweregrad da Desktop-only sichtbar, aber sollte auf `2.75rem` angehoben werden.

```css
/* Aktuell */
.dashboard-filter {
  min-height: 2.5rem;   /* 40px — grenzwertig */
}

/* Fix */
.dashboard-filter {
  min-height: 2.75rem;  /* 44px */
}
```

### M3: `.table-action` — 41.6px, gleicher Wert wie Hauptbug

**Datei:** `src/index.css` Zeile 742–757

`.table-action` hat `min-height: 2.6rem` (41.6px). Interaktive Edit/Delete-Buttons in der Subscription-Tabelle. Dieselbe 2px-Lücke wie Fix 1. Fix: `min-height: 2.75rem`.

### M4: `.modal-inline-action` — kein `min-height`

**Datei:** `src/index.css` Zeile 822–834

`.modal-inline-action` (die Dienst-Erkennung-Pills im Lookup-Panel) hat kein `min-height`, nur `padding: 0.55rem 0.8rem`. Bei Standard-Schriftgröße ergibt das ~34px Gesamthöhe. Sollte `min-height: 2.75rem` bekommen.

---

## Overflow — False Positive bestätigt

Der Playwright-Report "Overflow false positive" ist korrekt. Im Code:

- `body` hat `overflow-x: hidden` (Zeile 196) — verhindert horizontalen Scroll korrekt
- `.modal-backdrop` ist `position: fixed; inset: 0` — korrekt, kein Layout-Impact
- `.panel-card` hat `overflow: hidden` (Zeile 301) — für Clip-Effekte, kein Bug

Kein echter Overflow-Bug im Code. Automated Tools melden manchmal `overflow` wenn `position: fixed`-Elemente den gemessenen Scroll-Container beeinflussen.

---

## Accessibility

### A1: Kein Focus-Trap im Modal — kritisch für Tastatur-Nutzer

**Datei:** `src/components/SubscriptionModal.jsx`

Das Modal implementiert Escape-Handling (Zeile 43–55) und `aria-modal="true"` (Zeile 114). Es fehlt jedoch ein **Focus-Trap**: Tab-Druck verlässt das Modal in den Hintergrund-DOM. Laut ARIA-Authoring-Practices (APG Dialog Pattern) muss Tab/Shift+Tab innerhalb des Dialogs zirkulieren.

Aktueller Code öffnet mit `requestAnimationFrame(() => nameRef.current?.focus())` — das ist korrekt. Aber nach dem ersten Fokus ist der User frei, Tab-Navigation ins Hintergrund-UI zu führen.

**Empfehlung:** `focus-trap-react` (1.8 kB gzip) einbinden oder nativen `<dialog>`-Tag nutzen (der Focus-Trap nativ implementiert).

### A2: Filter-Buttons fehlt `aria-pressed`

**Datei:** `src/App.jsx` ca. Zeile 1130–1138

Die `dashboard-filter`-Buttons (Status/Kategorie-Filter in der Subscription-Liste) haben keine `aria-pressed`-Attribute. Screen-Reader können den aktiven Zustand nicht kommunizieren.

```jsx
// Aktuell
<button
  type="button"
  onClick={() => setFilter(option.key)}
  className={`dashboard-filter ${isActive ? 'dashboard-filter--active' : ''}`}
>

// Fix
<button
  type="button"
  aria-pressed={isActive}
  onClick={() => setFilter(option.key)}
  className={`dashboard-filter ${isActive ? 'dashboard-filter--active' : ''}`}
>
```

### A3: Modal-Close-Button hat `aria-label` — korrekt

`SubscriptionModal.jsx` Zeile 136: `aria-label="Schließen"` — kein Fix nötig.

### A4: `role="dialog"` ohne explizites `aria-describedby`

**Datei:** `src/components/SubscriptionModal.jsx` Zeile 112–117

`aria-labelledby` ist korrekt gesetzt. `aria-describedby` fehlt (z. B. auf den Subtitel-Absatz). Nicht blockierend, aber ARIA-APG empfiehlt es.

---

## Code Quality

### Q1: `currency` State — Implementierung korrekt

**Datei:** `src/App.jsx` Zeilen 25–26, 264–280, 489–493

Die `CURRENCIES`-Whitelist, der Initialisierungs-Guard (`CURRENCIES.includes(stored) ? stored : 'EUR'`), die `useMemo`-Abkapselung des Formatters, und die `useCallback`-Wrapper für `handleCurrencyChange` sind alle korrekt implementiert. Kein Bug, kein Refactoring-Bedarf.

### Q2: `dashboard-button--secondary` Theme-Lock

**Datei:** `src/index.css` Zeile 387

```css
.dashboard-button--secondary {
  background: linear-gradient(180deg, rgba(28, 36, 31, 0.94) 0%, rgba(20, 27, 23, 0.98) 100%);
```

Die Hintergrundfarbe ist hardcoded auf Forest-Grün-Töne — sie ignoriert das Theme-System (CSS-Variablen). Alle anderen Themes erben trotzdem einen grünlichen Secondary-Button. Sollte auf `var(--surface-3)` o.ä. umgestellt werden.

### Q3: Tablet-Override per strukturellen CSS-Selektoren

**Datei:** `src/index.css` Zeilen 931–938

```css
.hero-panel > .relative > .grid { ... }
.grid.md\\:grid-cols-2.xl\\:grid-cols-4 { ... }
```

Diese Selektoren koppeln CSS direkt an JSX-DOM-Struktur und Tailwind-Klassen-Namen. Sie brechen sobald die JSX-Struktur refactored wird. Besser: dedizierte CSS-Klassen auf den Elementen vergeben.

### Q4: CSS-Redundanz `section-title` `margin`

**Datei:** `src/index.css` Zeile 323–331

`.section-title` deklariert `margin: 0 0 1rem`. In `SubscriptionModal.jsx` Zeile 120 wird dieselbe Klasse eingesetzt, aber sofort durch Tailwind `mt-6` etc. überschrieben. Keine Funktions-Bug, leichte Inkonsistenz.

---

## Freigabe

**Status: APPROVED WITH CHANGES**

Die zwei kritischen Fixes (Touch Target 44px, Modal-Scroll) sind Einzeiler und risikoarm. Der fehlende Focus-Trap ist accessibility-kritisch für Tastatur-/Screen-Reader-Nutzer und sollte vor einem öffentlichen Release nachgezogen werden. Alle anderen Punkte sind Minor.

| Priorität | Issue | Aufwand |
|-----------|-------|---------|
| P0 | Modal `max-height` + `overflow-y: auto` | ~5 min |
| P0 | `.dashboard-button` Mobile `min-height: 2.75rem` | ~2 min |
| P1 | Focus-Trap im Modal | ~30 min |
| P1 | Filter-Buttons `aria-pressed` | ~5 min |
| P2 | `.dashboard-filter`, `.table-action`, `.modal-inline-action` Touch Targets | ~10 min |
| P3 | Secondary-Button Theme-Lock | ~15 min |
| P3 | Tablet-CSS strukturelle Selektoren | ~30 min |
