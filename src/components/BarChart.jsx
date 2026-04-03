export default function BarChart({ data }) {
  const max = Math.max(0, ...data.map(d => d.amount));

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monatliche Ausgaben (6 Monate)</h2>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const height = max > 0 ? (d.amount / max) * 100 : 0;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">{d.amount.toFixed(0)}€</span>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${height}%`,
                  background: isLast
                    ? 'linear-gradient(180deg, #F59E0B, #B45309)'
                    : 'linear-gradient(180deg, #3B82F6, #1e3a5f)',
                  minHeight: 4,
                }}
                title={`${d.month}: ${d.amount.toFixed(2)}€`}
                role="img"
                aria-label={`${d.month}: ${d.amount.toFixed(2)} Euro`}
              />
              <span className="text-xs text-slate-500">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
