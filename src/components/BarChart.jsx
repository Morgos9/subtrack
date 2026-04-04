export default function BarChart({ data, formatCurrency }) {
  const max = Math.max(0, ...data.map(d => d.amount));

  const defaultFormat = (value) => `${value.toFixed(2)} €`;
  const fmt = formatCurrency ?? defaultFormat;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--text-3)] uppercase tracking-wider">Monatliche Ausgaben (6 Monate)</h2>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const height = max > 0 ? (d.amount / max) * 100 : 0;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-[var(--text-3)]">{fmt(d.amount)}</span>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${height}%`,
                  background: isLast ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.35)',
                  minHeight: 4,
                }}
                title={`${d.month}: ${fmt(d.amount)}`}
                role="img"
                aria-label={`${d.month}: ${fmt(d.amount)}`}
              />
              <span className="text-xs text-[var(--text-4)]">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
