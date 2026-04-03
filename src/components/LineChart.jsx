import { useMemo, useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const formatCurrency = (value) => currencyFormatter.format(value);
const formatPercent = (value) =>
  `${value >= 0 ? '+' : ''}${percentFormatter.format(value)}%`;

const CHART_PAD = { top: 18, right: 18, bottom: 36, left: 52 };

export default function LineChart({
  data,
  range = '6m',
  onRangeChange,
  rangeOptions = [],
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const W = 640;
  const H = 220;
  const plotW = W - CHART_PAD.left - CHART_PAD.right;
  const plotH = H - CHART_PAD.top - CHART_PAD.bottom;

  const chartState = useMemo(() => {
    const values = data.map((entry) => entry.amount);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const basePadding = Math.max((rawMax - rawMin) * 0.2, 6);
    const minValue = Math.max(0, rawMin - basePadding);
    const maxValue = rawMax + basePadding;
    const valueRange = Math.max(maxValue - minValue, 1);

    const points = data.map((entry, index) => {
      const position = data.length === 1 ? 0.5 : index / (data.length - 1);
      return {
        ...entry,
        x: CHART_PAD.left + position * plotW,
        y: CHART_PAD.top + plotH - ((entry.amount - minValue) / valueRange) * plotH,
      };
    });

    const latest = values[values.length - 1] ?? 0;
    const previous = values[values.length - 2] ?? latest;
    const average =
      values.length > 0
        ? values.reduce((sum, amount) => sum + amount, 0) / values.length
        : 0;
    const peak = points.reduce(
      (current, point) => (!current || point.amount > current.amount ? point : current),
      null,
    );

    return {
      average,
      max: maxValue,
      min: minValue,
      peak,
      points,
      trend: previous ? ((latest - previous) / previous) * 100 : 0,
    };
  }, [data, plotH, plotW]);

  const { average, max, min, peak, points, trend } = chartState;
  const activePoint = hoveredIndex === null ? null : points[hoveredIndex];
  const currentValue = data[data.length - 1]?.amount ?? 0;
  const periodLabel = data.length
    ? data.length === 1
      ? data[0].month
      : `${data[0].month} bis ${data[data.length - 1].month}`
    : 'Keine Daten';

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${CHART_PAD.left + plotW} ${CHART_PAD.top + plotH} L ${CHART_PAD.left} ${CHART_PAD.top + plotH} Z`;

  const yLabels = useMemo(() => {
    return Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      const value = max - (max - min) * ratio;
      return {
        y: CHART_PAD.top + plotH * ratio,
        label: formatCurrency(value).replace(',00', ''),
      };
    });
  }, [max, min, plotH]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="section-title">Monatsausgaben</p>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text-1)]">
              {formatCurrency(currentValue)}
            </p>
            <span className="dashboard-pill dashboard-pill--accent">
              {formatPercent(trend)} vs. Vormonat
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--text-3)]">Fenster: {periodLabel}</p>
        </div>

        {rangeOptions.length > 0 && (
          <div
            className="inline-flex rounded-full border p-1"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            {rangeOptions.map((option) => {
              const isActive = option.key === range;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onRangeChange?.(option.key)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                      : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                  }`}
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <svg
        className="mt-6 h-[220px] w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Monatliche Ausgaben als Liniendiagramm"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="line-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.36" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-chart-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-dim)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        {yLabels.map((label, index) => (
          <g key={`${label.label}-${index}`}>
            <line
              className="chart-grid-line"
              x1={CHART_PAD.left}
              y1={label.y}
              x2={CHART_PAD.left + plotW}
              y2={label.y}
            />
            <text
              x={CHART_PAD.left - 10}
              y={label.y + 4}
              textAnchor="end"
              className="chart-label"
            >
              {label.label}
            </text>
          </g>
        ))}

        <path className="chart-area-fill" d={areaPath} fill="url(#line-chart-fill)" />

        <path
          d={linePath}
          fill="none"
          stroke="url(#line-chart-stroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-area-line"
        />

        {points.map((point, index) => (
          <g key={point.month} onMouseEnter={() => setHoveredIndex(index)}>
            <rect
              x={point.x - plotW / Math.max(points.length, 1) / 2}
              y={CHART_PAD.top}
              width={plotW / Math.max(points.length, 1)}
              height={plotH}
              fill="transparent"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 5.5 : 4}
              fill={hoveredIndex === index ? 'var(--accent)' : 'rgba(15, 20, 17, 0.92)'}
              stroke="var(--accent)"
              strokeWidth="2"
              style={{ transition: 'r 160ms ease' }}
            />
            <text
              x={point.x}
              y={H - 8}
              textAnchor="middle"
              className="chart-label"
            >
              {point.month}
            </text>
          </g>
        ))}

        {activePoint && (
          <g pointerEvents="none">
            <line
              x1={activePoint.x}
              y1={CHART_PAD.top}
              x2={activePoint.x}
              y2={CHART_PAD.top + plotH}
              stroke="rgba(var(--accent-rgb), 0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />

            <rect
              x={Math.max(16, Math.min(activePoint.x - 56, W - 128))}
              y={Math.max(8, activePoint.y - 54)}
              width="112"
              height="42"
              rx="12"
              fill="rgba(13, 18, 15, 0.96)"
              stroke="rgba(var(--accent-rgb), 0.16)"
            />
            <text
              x={Math.max(72, Math.min(activePoint.x, W - 72))}
              y={Math.max(30, activePoint.y - 28)}
              textAnchor="middle"
              fill="var(--text-1)"
              fontSize="12"
              fontWeight="700"
            >
              {formatCurrency(activePoint.amount)}
            </text>
            <text
              x={Math.max(72, Math.min(activePoint.x, W - 72))}
              y={Math.max(45, activePoint.y - 12)}
              textAnchor="middle"
              fill="var(--text-3)"
              fontSize="11"
            >
              {activePoint.month}
            </text>
          </g>
        )}
      </svg>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricTile label="Fenster" value={periodLabel} />
        <MetricTile label="Ø pro Monat" value={formatCurrency(average)} />
        <MetricTile
          label="Peak"
          value={peak ? formatCurrency(peak.amount) : '0,00 €'}
          meta={peak ? peak.month : 'Keine Daten'}
        />
      </div>
    </div>
  );
}

function MetricTile({ label, value, meta }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--text-1)]">{value}</p>
      {meta && <p className="mt-2 text-sm text-[var(--text-3)]">{meta}</p>}
    </div>
  );
}
