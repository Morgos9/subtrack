import { useEffect, useId, useRef, useState } from 'react';
import { toISODateLocal } from '../utils/date';
import { lookupSubscriptionPrice } from '../utils/priceLookup';

const CATEGORIES = ['Streaming', 'Software', 'Fitness', 'Gaming', 'Music', 'Other'];
const STATUSES = ['active', 'paused', 'cancelled'];

function createInitialForm(sub) {
  return sub || {
    name: '', category: 'Streaming', cost: '',
    billing: 'monthly', nextBilling: toISODateLocal(new Date()),
    status: 'active', icon: '📦',
  };
}

const fieldClass = `
  w-full rounded-xl px-3 py-2.5 text-sm
  focus:outline-none focus:border-[var(--accent)] transition-colors
`.trim();
const fieldStyle = {
  background: 'var(--surface)',
  border: '1.5px solid var(--border)',
  color: 'var(--text-1)',
};

export default function SubscriptionModal({ sub, onSave, onClose }) {
  const uid = useId();
  const nameRef = useRef(null);
  const [form, setForm] = useState(() => createInitialForm(sub));
  const [priceMatches, setPriceMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [lookedUp, setLookedUp] = useState(false);

  useEffect(() => { requestAnimationFrame(() => nameRef.current?.focus()); }, []);
  useEffect(() => {
    const fn = e => {
      if (e.key !== 'Escape') return;
      if (priceMatches.length > 0) {
        e.preventDefault();
        setPriceMatches([]);
        setSelectedMatch(null);
        setLookedUp(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, priceMatches.length]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePriceLookup = () => {
    const matches = lookupSubscriptionPrice(form.name);
    setLookedUp(true);
    setPriceMatches(matches);
    const preserved = matches.find(m => m.label === selectedMatch?.label);
    setSelectedMatch(preserved ?? matches[0] ?? null);
  };

  const applyPlan = (match, plan) => {
    setForm(f => ({ ...f, cost: String(plan.monthly), icon: match.icon, category: match.category }));
    setPriceMatches([]);
    setSelectedMatch(null);
    setLookedUp(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim() || form.cost === '') return;
    const cost = Number.parseFloat(String(form.cost).replace(',', '.'));
    if (!Number.isFinite(cost)) return;
    onSave({ ...form, cost, id: sub?.id || Date.now() });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{
          background: 'var(--surface-2)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 80px rgba(163,230,53,0.05)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id={`${uid}-title`} className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
            {sub ? 'Abo bearbeiten' : 'Neues Abo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xl leading-none"
            style={{ color: 'var(--text-3)', background: 'var(--surface)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name + Price lookup */}
          <div>
            <label htmlFor={`${uid}-name`} className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-3)' }}>
              Name
            </label>
            <div className="flex gap-2">
              <input
                ref={nameRef}
                id={`${uid}-name`}
                className={fieldClass}
                style={fieldStyle}
                value={form.name}
                onChange={e => { set('name', e.target.value); setPriceMatches([]); setSelectedMatch(null); setLookedUp(false); }}
                placeholder="z.B. Netflix"
                required
              />
              <button
                type="button"
                onClick={handlePriceLookup}
                disabled={form.name.trim().length < 2}
                className="px-3 py-2 rounded-xl text-sm font-medium transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1.5px solid var(--border)' }}
              >
                🔍
              </button>
            </div>

            <div aria-live="polite">
            {priceMatches.length > 0 && (
              <div className="mt-2 rounded-xl p-3 flex flex-col gap-2" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Plan wählen:</p>
                {priceMatches.length > 1 && (
                  <div className="flex gap-1 flex-wrap">
                    {priceMatches.map(m => (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setSelectedMatch(m)}
                        className="px-2 py-1 text-xs rounded-lg transition-colors"
                        style={selectedMatch?.label === m.label
                          ? { background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                          : { background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                )}
                {selectedMatch && (
                  <div className="flex flex-col gap-1">
                    {selectedMatch.plans.map(plan => (
                      <button
                        key={plan.label}
                        type="button"
                        onClick={() => applyPlan(selectedMatch, plan)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <span>{plan.label}</span>
                        <span className="font-bold" style={{ color: 'var(--accent)' }}>{plan.monthly.toFixed(2)} €/Mo</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setPriceMatches([]); setSelectedMatch(null); setLookedUp(false); }}
                  className="text-xs text-left mt-1 transition-colors"
                  style={{ color: 'var(--text-3)' }}
                >
                  ✕ Schließen
                </button>
              </div>
            )}
            {lookedUp && priceMatches.length === 0 && (
              <div className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
                Kein Dienst gefunden.
              </div>
            )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${uid}-cost`} className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-3)' }}>Kosten (€)</label>
              <input
                id={`${uid}-cost`}
                type="number" step="0.01" min="0"
                className={fieldClass} style={fieldStyle}
                value={form.cost}
                onChange={e => set('cost', e.target.value)}
                placeholder="9.99" required
              />
            </div>
            <div>
              <label htmlFor={`${uid}-icon`} className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-3)' }}>Emoji-Icon</label>
              <input
                id={`${uid}-icon`}
                className={fieldClass} style={fieldStyle}
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                placeholder="🎬"
              />
            </div>
            <div>
              <label htmlFor={`${uid}-cat`} className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-3)' }}>Kategorie</label>
              <select
                id={`${uid}-cat`}
                className={fieldClass} style={fieldStyle}
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-status`} className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-3)' }}>Status</label>
              <select
                id={`${uid}-status`}
                className={fieldClass} style={fieldStyle}
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={`${uid}-next`} className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-3)' }}>Nächste Abbuchung</label>
              <input
                id={`${uid}-next`}
                type="date"
                className={fieldClass} style={fieldStyle}
                value={form.nextBilling}
                onChange={e => set('nextBilling', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1.5px solid var(--border)', color: 'var(--text-2)', background: 'transparent' }}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, #a3e635, #6bbf1c)',
                color: '#0d1410',
                boxShadow: '0 0 16px rgba(163,230,53,0.25)',
              }}
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
