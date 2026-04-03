import { useEffect, useId, useRef, useState } from 'react';
import { toISODateLocal } from '../utils/date';
import { lookupSubscriptionPrice } from '../utils/priceLookup';

const CATEGORIES = ['Streaming', 'Software', 'Fitness', 'Gaming', 'Music', 'Other'];
const STATUSES = ['active', 'paused', 'cancelled'];

function createInitialForm(sub) {
  return (
    sub || {
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
  const titleId = `${uid}-title`;
  const nameId = `${uid}-name`;
  const costId = `${uid}-cost`;
  const iconId = `${uid}-icon`;
  const categoryId = `${uid}-category`;
  const statusId = `${uid}-status`;
  const nextBillingId = `${uid}-nextBilling`;
  const nameRef = useRef(null);
  const [form, setForm] = useState(() => createInitialForm(sub));
  const [priceMatches, setPriceMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => nameRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePriceLookup = () => {
    const matches = lookupSubscriptionPrice(form.name);
    setPriceMatches(matches);
    setSelectedMatch(matches[0] ?? null);
  };

  const applyPlan = (match, plan) => {
    setForm(f => ({
      ...f,
      cost: plan.monthly,
      icon: match.icon,
      category: match.category,
    }));
    setPriceMatches([]);
    setSelectedMatch(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim() || form.cost === '') return;
    const normalized = String(form.cost).replace(',', '.');
    const cost = Number.parseFloat(normalized);
    if (!Number.isFinite(cost)) return;
    onSave({ ...form, cost, id: sub?.id || Date.now() });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id={titleId} className="text-lg font-semibold text-slate-100">
            {sub ? 'Abo bearbeiten' : 'Neues Abo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dialog schließen"
            className="text-slate-400 hover:text-slate-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor={nameId} className="text-xs text-slate-400 mb-1 block">Name</label>
              <div className="flex gap-2">
                <input
                  ref={nameRef}
                  id={nameId}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  value={form.name}
                  onChange={e => {
                    set('name', e.target.value);
                    setPriceMatches([]);
                    setSelectedMatch(null);
                  }}
                  placeholder="z.B. Netflix"
                  required
                />
                <button
                  type="button"
                  onClick={handlePriceLookup}
                  disabled={form.name.trim().length < 2}
                  title="Preis automatisch abrufen"
                  className="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-sm transition-colors shrink-0"
                >
                  🔍 Preis
                </button>
              </div>

              {priceMatches.length > 0 && (
                <div className="mt-2 bg-slate-900 border border-slate-600 rounded-xl p-3 flex flex-col gap-2">
                  <p className="text-xs text-slate-400 font-medium">Gefundene Dienste — Plan wählen:</p>

                  {/* Service tabs */}
                  {priceMatches.length > 1 && (
                    <div className="flex gap-1 flex-wrap">
                      {priceMatches.map(m => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setSelectedMatch(m)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                            selectedMatch?.label === m.label
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {m.icon} {m.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Plan buttons for selected service */}
                  {selectedMatch && (
                    <div className="flex flex-col gap-1">
                      {selectedMatch.plans.map(plan => (
                        <button
                          key={plan.label}
                          type="button"
                          onClick={() => applyPlan(selectedMatch, plan)}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-700 hover:bg-blue-700 text-sm text-slate-200 transition-colors"
                        >
                          <span>{plan.label}</span>
                          <span className="font-semibold text-amber-400">{plan.monthly.toFixed(2)} €/Mo</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => { setPriceMatches([]); setSelectedMatch(null); }}
                    className="text-xs text-slate-500 hover:text-slate-300 text-left mt-1"
                  >
                    ✕ Schließen
                  </button>
                </div>
              )}

              {priceMatches.length === 0 && form.name.trim().length >= 2 && (
                <p id={`${uid}-no-match`} className="text-xs text-slate-500 mt-1 hidden" aria-live="polite">
                  Kein Dienst gefunden.
                </p>
              )}
            </div>
            <div>
              <label htmlFor={costId} className="text-xs text-slate-400 mb-1 block">Kosten (€)</label>
              <input
                id={costId}
                type="number"
                step="0.01"
                min="0"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                value={form.cost}
                onChange={e => set('cost', e.target.value)}
                placeholder="9.99"
                required
              />
            </div>
            <div>
              <label htmlFor={iconId} className="text-xs text-slate-400 mb-1 block">Emoji-Icon</label>
              <input
                id={iconId}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                placeholder="🎬"
              />
            </div>
            <div>
              <label htmlFor={categoryId} className="text-xs text-slate-400 mb-1 block">Kategorie</label>
              <select
                id={categoryId}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={statusId} className="text-xs text-slate-400 mb-1 block">Status</label>
              <select
                id={statusId}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={nextBillingId} className="text-xs text-slate-400 mb-1 block">Nächste Abbuchung</label>
              <input
                id={nextBillingId}
                type="date"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                value={form.nextBilling}
                onChange={e => set('nextBilling', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
