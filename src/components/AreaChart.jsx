import { useMemo, useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PAD = { top: 20, right: 16, bottom: 40, left: 56 };
const W = 640;
const H = 220;
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const MotionDiv = motion.div;

export default function AreaChart({ data = [], formatCurrency }) {
  const fmt = typeof formatCurrency === 'function' ? formatCurrency : (v) => `${Number(v).toFixed(2)} €`;
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const safeData = (data || []).map(d => ({ ...d, amount: Number.isFinite(Number(d?.amount)) ? Number(d.amount) : 0 }));

  const currentMonthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('de-DE', { month: 'short' });
  }, []);

  const chartState = useMemo(() => {
    if (!safeData.length) return { points: [], max: 1, min: 0 };

    const values = safeData.map((d) => d.amount);
    const rawMax = Math.max(...values);
    const rawMin = Math.min(...values);
    const padding = Math.max((rawMax - rawMin) * 0.2, 5);
    const min = Math.max(0, rawMin - padding);
    const max = rawMax + padding;
    const range = Math.max(max - min, 1);

    const points = safeData.map((entry, i) => {
      const xRatio = safeData.length === 1 ? 0.5 : i / (safeData.length - 1);
      return {
        ...entry,
        x: PAD.left + xRatio * PLOT_W,
        y: PAD.top + PLOT_H - ((entry.amount - min) / range) * PLOT_H,
      };
    });

    return { points, max, min };
  }, [safeData]);

  const { points, max, min } = chartState;
  const hasData = points.length > 0;

  const linePath = hasData
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const areaPath = hasData
    ? `${linePath} L ${PAD.left + PLOT_W} ${PAD.top + PLOT_H} L ${PAD.left} ${PAD.top + PLOT_H} Z`
    : '';

  const yLabels = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const ratio = i / 3;
      const value = max - (max - min) * ratio;
      return {
        y: PAD.top + PLOT_H * ratio,
        label: fmt(value).replace(',00', ''),
      };
    });
  }, [max, min, fmt]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <MotionDiv
      className="glass-sub-card rounded-2xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    >
      <p className="section-title">12-Monats-Trend</p>
      <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--text-1)]">
        Monatliche Ausgaben im Jahresverlauf
      </h3>

      {hasData ? (
        <svg
          className="mt-5 h-[220px] w-full"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="12-Monats Area Chart der monatlichen Ausgaben"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent, var(--accent))" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--color-accent, var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yLabels.map((label, i) => (
            <g key={`y-${i}`}>
              <line
                className="chart-grid-line"
                x1={PAD.left}
                y1={label.y}
                x2={PAD.left + PLOT_W}
                y2={label.y}
              />
              <text
                x={PAD.left - 10}
                y={label.y + 4}
                textAnchor="end"
                className="chart-label"
              >
                {label.label}
              </text>
            </g>
          ))}

          <path d={areaPath} fill={`url(#${gradientId})`} />

          <path
            d={linePath}
            fill="none"
            stroke="var(--color-accent, var(--accent))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, i) => {
            const isCurrentMonth = point.month === currentMonthLabel;
            const isHovered = hoveredIndex === i;
            return (
              <g key={`pt-${i}`} onMouseEnter={() => setHoveredIndex(i)}>
                <rect
                  x={point.x - PLOT_W / Math.max(points.length, 1) / 2}
                  y={PAD.top}
                  width={PLOT_W / Math.max(points.length, 1)}
                  height={PLOT_H}
                  fill="transparent"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 5.5 : isCurrentMonth ? 5 : 3.5}
                  fill={
                    isHovered || isCurrentMonth
                      ? 'var(--color-accent, var(--accent))'
                      : 'rgba(15, 20, 17, 0.92)'
                  }
                  stroke="var(--color-accent, var(--accent))"
                  strokeWidth="2"
                  style={{ transition: 'r 160ms ease' }}
                />
                <text
                  x={point.x}
                  y={H - 8}
                  textAnchor="middle"
                  className="chart-label"
                  fontWeight={isCurrentMonth ? '700' : '400'}
                  fill={
                    isCurrentMonth
                      ? 'var(--color-accent, var(--accent))'
                      : undefined
                  }
                >
                  {point.month}
                </text>
              </g>
            );
          })}

          {activePoint && (
            <g pointerEvents="none">
              <line
                x1={activePoint.x}
                y1={PAD.top}
                x2={activePoint.x}
                y2={PAD.top + PLOT_H}
                stroke="rgba(var(--accent-rgb), 0.40)"
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
                {fmt(activePoint.amount)}
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
      ) : (
        <div className="mt-5 flex h-[220px] items-center justify-center text-sm text-[var(--text-3)]">
          Keine historischen Daten verfügbar.
        </div>
      )}
    </MotionDiv>
  );
}
