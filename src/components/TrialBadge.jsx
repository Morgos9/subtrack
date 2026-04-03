import { parseISODateLocal, startOfDay } from '../utils/date';

/**
 * Zeigt einen farbigen Badge an, wenn ein Abo einen aktiven Trial hat.
 * - <= 3 Tage: rot + animate-pulse
 * - 4–7 Tage: orange
 * - > 7 Tage: amber/gelb
 * Wenn trialEndDate null/leer ist oder bereits abgelaufen: kein Badge.
 */
export default function TrialBadge({ trialEndDate }) {
  if (!trialEndDate) return null;

  const today = startOfDay(new Date());
  const end = parseISODateLocal(trialEndDate);
  if (!end) return null;

  const msLeft = end - today;
  if (msLeft < 0) return null; // abgelaufen

  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  let colorClass;
  let pulse = false;

  if (daysLeft <= 3) {
    colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
    pulse = true;
  } else if (daysLeft <= 7) {
    colorClass = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
  } else {
    colorClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${colorClass} ${pulse ? 'motion-safe:animate-pulse' : ''}`}
    >
      Trial: noch {daysLeft} {daysLeft === 1 ? 'Tag' : 'Tage'}
    </span>
  );
}
