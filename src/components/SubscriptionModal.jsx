import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { toISODateLocal } from '../utils/date';
import { lookupSubscriptionPrice } from '../utils/priceLookup';

const CATEGORIES = ['Streaming', 'Software', 'Fitness', 'Gaming', 'Music', 'Other'];
const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monatlich' },
  { value: 'quarterly', label: 'Quartalsweise' },
  { value: 'yearly', label: 'Jährlich' },
];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'paused', label: 'Pausiert' },
  { value: 'cancelled', label: 'Gekündigt' },
];

function createInitialForm(sub) {
  return (
    sub ?? {
      name: '',
      category: 'Streaming',
      cost: '',
      billing: 'monthly',
      nextBilling: toISODateLocal(new Date()),
      status: 'active',
      icon: '📦',
    }
  );
}

export default function SubscriptionModal({ sub, onSave, onClose }) {
  const uid = useId();
  const nameRef = useRef(null);
  const [form, setForm] = useState(() => createInitialForm(sub));
  const [priceMatches, setPriceMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [lookedUp, setLookedUp] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => nameRef.current?.focus());
  }, []);

  const handleEscape = useEffectEvent((event) => {
    if (event.key !== 'Escape') return;

    if (priceMatches.length > 0) {
      event.preventDefault();
      setPriceMatches([]);
      setSelectedMatch(null);
      setLookedUp(false);
      return;
    }

    onClose();
  });

  useEffect(() => {
    const onKeyDown = (event) => handleEscape(event);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleLookup = () => {
    const matches = lookupSubscriptionPrice(form.name);
    setLookedUp(true);
    setPriceMatches(matches);
    const preserved = matches.find((match) => match.label === selectedMatch?.label);
    setSelectedMatch(preserved ?? matches[0] ?? null);
  };

  const applyPlan = (match, plan) => {
    setForm((current) => ({
      ...current,
      cost: String(plan.monthly),
      icon: match.icon,
      category: match.category,
    }));
    setPriceMatches([]);
    setSelectedMatch(null);
    setLookedUp(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || form.cost === '') return;

    const cost = Number.parseFloat(String(form.cost).replace(',', '.'));
    if (!Number.isFinite(cost)) return;

    onSave({
      ...form,
      cost,
      id: sub?.id || Date.now(),
    });
  };

  const lookupSummary = selectedMatch
    ? `${selectedMatch.label} erkannt · Preise werden als Monatsäquivalent übernommen.`
    : 'Die Vorschläge übernehmen den Monatswert, damit deine Analytics konsistent bleiben.';

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="modal-shell"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-title">Subscription editor</p>
            <h2
              id={`${uid}-title`}
              className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-1)]"
            >
              {sub ? 'Abo bearbeiten' : 'Neues Abo'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">
              Pflege Stammdaten, hinterlege das Monatsäquivalent sauber und halte dein Portfolio
              aktuell.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="dashboard-icon-button"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <section className="modal-section">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label htmlFor={`${uid}-name`} className="field-label">
                    Dienstname
                  </label>
                  <input
                    ref={nameRef}
                    id={`${uid}-name`}
                    className="dashboard-input"
                    value={form.name}
                    onChange={(event) => {
                      updateField('name', event.target.value);
                      setPriceMatches([]);
                      setSelectedMatch(null);
                      setLookedUp(false);
                    }}
                    placeholder="z. B. Netflix"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={form.name.trim().length < 2}
                  className="dashboard-button disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Preis finden
                </button>
              </div>

              <div aria-live="polite" className="mt-4">
                {priceMatches.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]">
                      Erkannten Dienst wählen
                    </p>

                    {priceMatches.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {priceMatches.map((match) => (
                          <button
                            key={match.label}
                            type="button"
                            onClick={() => setSelectedMatch(match)}
                            className={`modal-inline-action ${
                              selectedMatch?.label === match.label
                                ? 'modal-inline-action--active'
                                : ''
                            }`}
                          >
                            {match.icon} {match.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedMatch && (
                      <div className="mt-4 grid gap-2">
                        {selectedMatch.plans.map((plan) => (
                          <button
                            key={plan.label}
                            type="button"
                            onClick={() => applyPlan(selectedMatch, plan)}
                            className="modal-plan-button"
                          >
                            <span>{plan.label}</span>
                            <span className="font-semibold text-[var(--accent)]">
                              {plan.monthly.toFixed(2)} €/Monat
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {lookedUp && priceMatches.length === 0 && (
                  <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm text-[var(--text-3)]">
                    Kein passender Dienst gefunden. Du kannst das Abo trotzdem manuell anlegen.
                  </div>
                )}
              </div>
            </section>

            <section className="modal-section">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`${uid}-cost`} className="field-label">
                    Kosten pro Monat
                  </label>
                  <input
                    id={`${uid}-cost`}
                    type="number"
                    step="0.01"
                    min="0"
                    className="dashboard-input"
                    value={form.cost}
                    onChange={(event) => updateField('cost', event.target.value)}
                    placeholder="9.99"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`${uid}-icon`} className="field-label">
                    Emoji-Icon
                  </label>
                  <input
                    id={`${uid}-icon`}
                    className="dashboard-input"
                    value={form.icon}
                    onChange={(event) => updateField('icon', event.target.value)}
                    placeholder="🎬"
                  />
                </div>

                <div>
                  <label htmlFor={`${uid}-category`} className="field-label">
                    Kategorie
                  </label>
                  <select
                    id={`${uid}-category`}
                    className="dashboard-input"
                    value={form.category}
                    onChange={(event) => updateField('category', event.target.value)}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`${uid}-status`} className="field-label">
                    Status
                  </label>
                  <select
                    id={`${uid}-status`}
                    className="dashboard-input"
                    value={form.status}
                    onChange={(event) => updateField('status', event.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`${uid}-billing`} className="field-label">
                    Abrechnungsintervall
                  </label>
                  <select
                    id={`${uid}-billing`}
                    className="dashboard-input"
                    value={form.billing}
                    onChange={(event) => updateField('billing', event.target.value)}
                  >
                    {BILLING_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`${uid}-next`} className="field-label">
                    Nächste Abbuchung
                  </label>
                  <input
                    id={`${uid}-next`}
                    type="date"
                    className="dashboard-input"
                    value={form.nextBilling}
                    onChange={(event) => updateField('nextBilling', event.target.value)}
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="dashboard-button dashboard-button--secondary"
              >
                Abbrechen
              </button>
              <button type="submit" className="dashboard-button">
                Speichern
              </button>
            </div>
          </form>

          <aside className="flex flex-col gap-4">
            <div className="modal-sidebar-card">
              <p className="section-title">Live Preview</p>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-2xl">
                  {form.icon || '📦'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-[var(--text-1)]">
                    {form.name.trim() || 'Neues Abo'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-3)]">{form.category}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <PreviewTile label="Monatswert" value={form.cost ? `${form.cost} €` : 'Noch offen'} />
                <PreviewTile
                  label="Status"
                  value={STATUS_OPTIONS.find((status) => status.value === form.status)?.label ?? form.status}
                />
                <PreviewTile
                  label="Abrechnung"
                  value={BILLING_OPTIONS.find((option) => option.value === form.billing)?.label ?? form.billing}
                />
              </div>
            </div>

            <div className="modal-sidebar-card">
              <p className="section-title">Lookup-Hinweis</p>
              <p className="text-sm leading-7 text-[var(--text-3)]">{lookupSummary}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--text-3)]">
                Tipp: Nutze das echte Intervall im Feld „Abrechnungsintervall“ und halte den Betrag
                als Monatsäquivalent fest. So bleiben Charts und Forecasts vergleichbar.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PreviewTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--text-1)]">{value}</p>
    </div>
  );
}
