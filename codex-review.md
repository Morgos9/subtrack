# Code-Review Bericht (Stand: 2026-04-03)

## Scope (angefordert)

- `src/App.jsx`
- `src/index.css`
- `src/components/SubscriptionTable.jsx`
- `src/components/SubscriptionModal.jsx`
- `src/components/LineChart.jsx`
- `src/components/UserWorkspacePanel.jsx`
- `package.json`
- `README.md`

## Kurzfazit

- Insgesamt wirkt das UI **mobile-first und breakpoint-konsistent** (primär `sm/md/lg/xl`, plus ein bewusstes Custom-Breakpoint `min-[480px]`).
- Keine offensichtlichen Public-Repo-Blocker in den angeforderten Dateien (keine gefundenen `console.log`, `TODO`, Secrets-Muster).
- Hauptthemen: ein paar **`xl:`-only Layout-Sprünge**, **ein `overflow-x-auto` ohne Kommentar/Rationale**, **`window.confirm()` in der UI**, sowie **fehlende `package.json`-Metadaten** für ein öffentliches Repo.

---

## 1) CODE-QUALITÄT (Responsive / Tailwind / Layout)

### 🟡 Finding: `xl:`-only Grid-Split ohne `lg:`/`md:` Zwischenstufe (Layout-Sprung)
- **Location:** `src/App.jsx:932`
- **Beobachtung:** Grid bekommt erst bei `xl` eine 2-Spalten-Definition (`xl:grid-cols-[...]`), darunter bleibt es 1-spaltig.
- **Warum relevant:** Zwischen `lg` (≥1024px) und `xl` (≥1280px) kann der verfügbare Platz oft schon reichen – ohne Zwischenstufe wirkt das Layout „sprunghaft“.
- **Vorschlag:** Prüfen, ob ein früherer Split sinnvoll ist, z. B. `lg:grid-cols-[...]` oder `md:grid-cols-2` + `xl:` Feintuning.

### 🟡 Finding: Wiederholtes `xl:`-only Grid-Split an mehreren Stellen
- **Location:** `src/App.jsx:1181`, `src/App.jsx:1254`
- **Beobachtung:** Gleiches Muster (`xl:grid-cols-[...]`) ohne `lg:`/`md:`.
- **Vorschlag:** Konsistent entscheiden, ob 2-Spalten Layout bereits ab `lg` (oder `md`) gelten soll, und das Muster im gesamten Dashboard angleichen.

### 🟡 Finding: `xl:`-only Layout-Alignment kann auf großen Laptops zu spät greifen
- **Location:** `src/App.jsx:1094`
- **Beobachtung:** `xl:grid-cols-[minmax(0,1fr)_auto]` + `xl:items-center` greift erst ab `xl`.
- **Vorschlag:** Falls die UI schon ab `lg` „reif“ ist, `lg:`-Zwischenstufe ergänzen; ansonsten kurz im Code/Designsystem dokumentieren, warum erst `xl`.

### 🟡 Finding: Custom Breakpoint `min-[480px]` ist konsistent, aber „nicht Standard“
- **Location:** `src/components/SubscriptionTable.jsx:117`
- **Beobachtung:** `min-[480px]:grid-cols-2` führt einen zusätzlichen Breakpoint ein, der von Tailwind-Standard (`sm=640`) abweicht.
- **Warum relevant:** Custom-Breakpoints sind okay, erhöhen aber die mentale Last und erschweren Konsistenz im Team.
- **Vorschlag:** Entweder auf `sm:grid-cols-2` umstellen oder (falls 480px Absicht ist) kurz begründen (z. B. Kommentar oder Design-Note).

### 🟡 Finding: `overflow-x-auto` vorhanden – ohne erklärende Rationale
- **Location:** `src/components/SubscriptionTable.jsx:148`
- **Beobachtung:** Wrapper nutzt `overflow-x-auto` für die Desktop-Tabelle.
- **Warum relevant:** Horizontal-Scroll ist UX-technisch oft ein „letztes Mittel“; ohne Kontext wirkt es wie ein Quick-Fix.
- **Vorschlag:** Kurz begründen (z. B. „min-width table for dense columns“), oder Alternativen prüfen:
  - Spalten reduzieren/komprimieren
  - responsives Table-Layout (z. B. Spalten ab `lg` ausblenden)
  - Tabelle ohne `min-w-[920px]` gestalten, falls möglich (`src/components/SubscriptionTable.jsx:149`)

### 🟢 OK: Mobile-first Breakpoints sind überwiegend sauber gesetzt
- **Location:** `src/components/SubscriptionTable.jsx:71`, `src/components/SubscriptionModal.jsx:143`, `src/components/LineChart.jsx:117`
- **Beobachtung:** Basislayout ist mobile-first; ab `md/lg` wird erweitert (Cards vs. Table, Modal 2-Spalten Layout, Chart Header Layout).

### 🟢 OK: CSS-Mediaqueries alignen mit Tailwind-„md/lg“ Schwellen
- **Location:** `src/index.css:816`, `src/index.css:835`, `src/index.css:847`
- **Beobachtung:** `767/1023/1024` passt zu Tailwind (`md=768`, `lg=1024`) und ist konsistent.

---

## 2) GITHUB-TAUGLICHKEIT (Public Repo Hygiene)

### 🟡 Finding: `package.json` fehlt Public-Repo-Metadaten (author/license/description/repository)
- **Location:** `package.json:2`
- **Beobachtung:** Vorhanden sind u. a. `name: "app"`, `private: true`, `version: "0.0.0"`; es fehlen typische Public-Repo-Felder.
- **Warum relevant:** Für öffentliche Repos wirkt das unvollständig; Tools/Scans/Packages profitieren von klaren Metadaten.
- **Vorschlag:** Ergänzen (Beispiele):
  - `"description"` (kurz, konsistent zum README)
  - `"license": "MIT"` (passt zum Repo-`LICENSE`)
  - `"repository": { "type": "git", "url": "..." }`
  - `"author"` (Name/Handle, optional Kontakt)
  - Optional: `"homepage"`, `"bugs"`

### 🟢 OK: README wirkt professionell und „öffentlichkeits-tauglich“
- **Location:** `README.md:1`, `README.md:105`, `README.md:268`, `README.md:283`
- **Beobachtung:** Gute Struktur (Screenshots, Setup, Architektur, Contributing, License), klare Positionierung, konsistente Sprache (Englisch).

---

## 3) BEST PRACTICES (A11y, Typing, UX)

### 🟡 Finding: `window.confirm()` für destructive Actions (UI/UX „prod-unfreundlich“)
- **Location:** `src/App.jsx:528`, `src/App.jsx:564`
- **Beobachtung:** Lösch-Aktionen nutzen Browser-Confirm.
- **Warum relevant:** Bricht Design/Branding, ist schwerer zu stylen/testen und kann je nach Browser/OS inkonsistent wirken.
- **Vorschlag:** Eigene Confirm-UI (Modal/Drawer/Toast) mit klarer Copy, sekundärer Aktion und optional „Undo“.

### 🟡 Finding: Modal-A11y – kein Focus-Trap / kein „Return Focus“ ersichtlich
- **Location:** `src/components/SubscriptionModal.jsx:112`
- **Beobachtung:** Modal hat korrekt `role="dialog"`/`aria-modal`, fokussiert initial das Namensfeld, aber es gibt keinen sichtbaren Focus-Trap oder Rücksprung-Fokus beim Schließen.
- **Warum relevant:** Keyboard-Nutzer können aus dem Dialog heraus-tabben; beim Schließen kann Fokus „verloren gehen“.
- **Vorschlag:** Focus-Trap (z. B. mit einer kleinen Utility oder Library) und beim Close Fokus zurück auf den auslösenden Button setzen.

### 🟢 OK: A11y-Attribute sind an vielen Stellen vorhanden
- **Location:** `src/components/SubscriptionModal.jsx:113`, `src/components/SubscriptionTable.jsx:149`, `src/components/LineChart.jsx:164`
- **Beobachtung:** Dialog hat `aria-*`, Tabelle hat `aria-label` + `caption`, SVG-Chart hat `role="img"` + `aria-label`.

### 🟡 Finding: Kein TypeScript / keine PropTypes (nur Hinweis, kein Fix nötig)
- **Location:** `src/components/SubscriptionTable.jsx:43`, `src/components/SubscriptionModal.jsx:31`, `src/components/LineChart.jsx:21`, `src/components/UserWorkspacePanel.jsx:21`
- **Beobachtung:** Komponenten sind ungetypt; Props werden nur implizit genutzt.
- **Vorschlag:** Entweder TypeScript einführen (empfohlen für Public Repos) oder minimal PropTypes für zentrale Komponenten ergänzen.

### 🟡 Finding: `aria-hidden` als String gesetzt (kleiner Konsistenzpunkt)
- **Location:** `src/App.jsx:577`
- **Beobachtung:** `aria-hidden` wird als `'true'/'false'` String gesetzt.
- **Vorschlag:** Konsistent boolean verwenden (`aria-hidden={!mobileNavOpen}`) oder an einer Stelle dokumentieren, dass Strings hier beabsichtigt sind.

