# Phase 2 — Änderungsprotokoll

## Geänderte Dateien

### 1. `src/index.css`

#### Glassmorphism 2.0

**Neue CSS-Tokens (alle 5 Themes)**
Jedes Theme-Block hat jetzt 6 neue `--glass-*`-Tokens:
- `--glass-panel` — Haupt-Panel-Hintergrund (~52% Opacity)
- `--glass-panel-muted` — gedämpfte Panel-Variante (~60% Opacity)
- `--glass-sidebar` — Sidebar-Hintergrund (~64% Opacity)
- `--glass-modal` — Modal-Hintergrund (~72% Opacity)
- `--glass-surface` — Ultra-leichte Oberfläche (`rgba(255,255,255,0.04)`)
- `--glass-border` — Inset-Highlight-Border (`rgba(255,255,255,0.08)`)

**`.panel-card` (vorher broken)**
- `background` von `linear-gradient(rgba(*,0.96),rgba(*,0.98))` auf `var(--glass-panel)` (~0.52) reduziert
- `-webkit-backdrop-filter: blur(12px) saturate(180%)` ergänzt (Safari-Fix)
- `backdrop-filter` mit `saturate(180%)` erweitert
- `box-shadow` mit `inset 0 1px 0 var(--glass-border)` für Glasskante ergänzt

**`.panel-card--muted`**
- Benutzt jetzt `var(--glass-panel-muted)` statt hartem Linear-Gradient

**`.dashboard-sidebar`**
- `background: var(--glass-sidebar)` hinzugefügt (war komplett undefiniert)
- `-webkit-backdrop-filter: blur(20px) saturate(160%)` ergänzt
- `backdrop-filter` mit `saturate(160%)` erweitert

**`.hero-stat`**
- `background` auf `var(--glass-surface)` (war `rgba(255,255,255,0.025)`)
- `-webkit-backdrop-filter: blur(8px) saturate(140%)` ergänzt
- `box-shadow` mit `inset 0 1px 0 var(--glass-border)` ergänzt

**`.modal-backdrop`**
- `backdrop-filter` auf `blur(16px) saturate(140%)` erweitert
- `-webkit-backdrop-filter` ergänzt

**`.modal-shell`**
- `background` von `linear-gradient(rgba(*,0.98),rgba(*,0.99))` auf `var(--glass-modal)` (~0.72) reduziert
- `-webkit-backdrop-filter: blur(24px) saturate(180%)` ergänzt
- `box-shadow` mit Inset-Glass-Border ergänzt

**`.modal-section` / `.modal-sidebar-card`**
- `background` auf `var(--glass-surface)` gesetzt
- `backdrop-filter: blur(6px)` + `-webkit-backdrop-filter` ergänzt

**`--header-bg` (alle Themes)**
- Opacity von `0.78` auf `0.72` reduziert für mehr Tiefe hinter dem Header

---

#### Responsive Design

**`@media (max-width: 1023px)` — Sidebar Drawer**
- Explizites `background: var(--glass-sidebar)` gesetzt (war nicht definiert → transparent)
- Stärkerer `backdrop-filter: blur(28px) saturate(160%)` für bessere Lesbarkeit des Drawers
- `box-shadow` von `0.4` auf `0.5` Opacity erhöht

**`@media (max-width: 767px)` — Mobile Fixes**
- `.focus-list-row` und `.sidebar-stat`: `align-items: flex-start` + `gap: 0.5rem` für sauberes Stapeln
- Neue Regel: Text-Rechtsausrichtung innerhalb `.focus-list-row` wird auf Mobile deaktiviert (`text-align: left; max-width: none`)
- Touch-Scrolling auf Tabellen-Wrapper explizit aktiviert

**Neue Breakpoints ergänzt:**

`@media (min-width: 768px) and (max-width: 1279px)` — Tablet-Fixes
- Hero-Panel zweite Spalte erzwingt 1-spaltig (wird durch App.jsx-Änderung primär gelöst, CSS als Fallback)

`@media (max-width: 479px)` — Sehr kleine Screens
- Header-Action-Buttons bekommen `flex-wrap`
- `dashboard-button` etwas kompakter (Padding/Font-Size)
- HeroStats fallen auf 1 Spalte

---

### 2. `src/App.jsx`

**Header — Inline-Style (Z. ~715)**
- `backdropFilter: 'blur(18px) saturate(160%)'` (war ohne `saturate`)
- `WebkitBackdropFilter: 'blur(18px) saturate(160%)'` neu hinzugefügt (Safari)

**Hero-Panel Grid (Z. ~808)**
- `md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]` → `xl:grid-cols-[...]`
- Auf md/lg (768–1279px): Panel ist jetzt einspaltig, kein Layout-Bruch
- Auf xl (1280px+): Zweispaltig wie zuvor

**Header Action-Buttons (Z. ~748)**
- `flex shrink-0 items-center gap-3` → `flex shrink-0 flex-wrap items-center gap-3`
- Verhindert Overflow auf schmalen Viewports

**Dreier-Panel-Grid — Dashboard (Z. ~1053) + Analytics (Z. ~1261)**
- TipsPanel-Wrapper: `md:col-span-2 xl:col-span-1` ergänzt
- Auf Tablet: TipsPanel nimmt beide Spalten der 2-Spalten-Grid ein (sauber, kein halbes Panel)
- Auf Desktop xl+: TipsPanel normales Drittel

---

## Was getestet werden sollte

### Glassmorphism
- [ ] Alle 5 Themes: Panel-Cards sollten halbtransparent über dem Hintergrund-Gradient erscheinen
- [ ] Sidebar auf Desktop: Glassmorphism sichtbar durch Transparenz
- [ ] Sidebar-Drawer auf Mobile (< 1024px): Öffnet mit opakerer Glass-Fläche, keine weißen/transparenten Löcher
- [ ] Modal-Overlay: Backdrop sollte weichzeichnen + dunkel sein
- [ ] Modal-Dialog selbst: Hintergrund transparent-dunkel, kein weißer Kasten
- [ ] Safari (iOS/macOS): `-webkit-backdrop-filter` muss greifen (Panels müssen unscharf sein)
- [ ] Chrome/Firefox: `backdrop-filter` korrekt

### Responsive Design
- [ ] **375px (iPhone SE):** Hero-Panel einspaltig, kein horizontaler Overflow
- [ ] **375px:** Focus-List-Rows stapeln vertikal, kein Text-Overlap
- [ ] **375px:** Header-Buttons wrappen korrekt (nicht abgeschnitten)
- [ ] **375px:** Sidebar-Drawer hat Hintergrund, Inhalt lesbar
- [ ] **768px (iPad):** Hero-Panel einspaltig
- [ ] **768px:** Dreier-Panel-Grid: DonutChart + UpcomingBills nebeneinander, TipsPanel darunter full-width
- [ ] **1024px:** Sidebar sticky, kein Drawer-Button sichtbar
- [ ] **1280px+:** Hero-Panel zweispaltig, Dreier-Panel-Grid dreispaltig
- [ ] **Alle Breakpoints:** Kein horizontaler Scrollbalken auf `body`

### Themes
- [ ] Forest → Ocean → Dusk → Ember → Rose: Glass-Tokens müssen themenpassend sein
- [ ] Theme-Wechsel in Settings: Panels färben sich korrekt um
