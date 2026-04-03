import { useMemo, useState } from 'react';

export default function LineChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 560;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 32, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const { points, min, max } = useMemo(() => {
    const vals = data.map(d => d.amount);
    const min = Math.min(...vals) * 0.95;
    const max = Math.max(...vals) * 1.05;
    const points = data.map((d, i) => ({
      x: PAD.left + (i / (data.length - 1)) * plotW,
      y: PAD.top + plotH - ((d.amount - min) / (max - min)) * plotH,
      ...d,
    }));
    return { points, min, max };
  }, [data]);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${(PAD.left + plotW).toFixed(1)},${(PAD.top + plotH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + plotH).toFixed(1)} Z`;

  const yLabels = [min, (min + max) / 2, max].map(v => ({
    y: PAD.top + plotH - ((v - min) / (max - min)) * plotH,
    label: `${v.toFixed(0)}€`,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-3)] uppercase tracking-widest font-medium">Monatsausgaben</p>
          <p className="text-2xl font-bold text-[var(--text-1)] mt-0.5">
            {data[data.length - 1]?.amount.toFixed(2)}€
            <span className="ml-2 text-sm font-medium text-[var(--accent)]">↑ +5.2%</span>
          </p>
        </div>
        <div className="flex gap-1">
          {['6M', '1J', 'All'].map(t => (
            <button
              key={t}
              className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors first:bg-[var(--accent-glow)] first:text-[var(--accent)] first:border-[var(--accent)]"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={l.y.toFixed(1)}
              x2={PAD.left + plotW} y2={l.y.toFixed(1)}
              stroke="#243328" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={PAD.left - 8} y={l.y + 4} textAnchor="end" fill="#4d7a58" fontSize="10">
              {l.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#a3e635"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="chart-area-line"
        />

        {/* X-axis labels + hover targets */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)}>
            {/* Invisible wider hit area */}
            <rect
              x={p.x - plotW / data.length / 2}
              y={PAD.top}
              width={plotW / data.length}
              height={plotH}
              fill="transparent"
            />
            <text
              x={p.x} y={PAD.top + plotH + 18}
              textAnchor="middle" fill="#4d7a58" fontSize="10"
            >
              {p.month}
            </text>
          </g>
        ))}

        {/* Hover tooltip */}
        {hovered !== null && (() => {
          const p = points[hovered];
          return (
            <g>
              <line
                x1={p.x} y1={PAD.top}
                x2={p.x} y2={PAD.top + plotH}
                stroke="#a3e635" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
              />
              <circle cx={p.x} cy={p.y} r="5" fill="#a3e635" stroke="#0d1410" strokeWidth="2" />
              <rect x={p.x - 38} y={p.y - 36} width="76" height="26" rx="6" fill="#1a2a1e" stroke="#243328" strokeWidth="1" />
              <text x={p.x} y={p.y - 19} textAnchor="middle" fill="#a3e635" fontSize="12" fontWeight="700">
                {p.amount.toFixed(2)}€
              </text>
              <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#4d7a58" fontSize="9">
                {p.month}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
