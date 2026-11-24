import { useId, useMemo, useState } from 'react';
import { cx } from '../../lib/cx';

/* -------------------------------------------------------------------------- */
/*  Area / line chart                                                         */
/* -------------------------------------------------------------------------- */
interface Series {
  name: string;
  color: string;
  values: number[];
  dashed?: boolean;
}

export function LineAreaChart({
  labels,
  series,
  height = 176,
  yFormat = (v: number) => String(v),
  ariaLabel,
  area = true,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  yFormat?: (v: number) => string;
  ariaLabel: string;
  area?: boolean;
}) {
  const gid = useId().replace(/:/g, '');
  const W = 640;
  const H = height;
  const pad = { top: 12, right: 12, bottom: 26, left: 40 };
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all) * 1.08;
  const min = Math.min(...all) * 0.9;
  const [hover, setHover] = useState<number | null>(null);

  const x = (i: number) =>
    pad.left + (i * (W - pad.left - pad.right)) / Math.max(1, labels.length - 1);
  const y = (v: number) =>
    pad.top + (1 - (v - min) / Math.max(1, max - min)) * (H - pad.top - pad.bottom);

  const path = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const areaPath = (values: number[]) =>
    `${path(values)} L${x(values.length - 1).toFixed(1)},${H - pad.bottom} L${x(0).toFixed(1)},${H - pad.bottom} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + t * (max - min));

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="none"
        className="overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient key={s.name} id={`${gid}-fill-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y(t)}
              y2={y(t)}
              stroke="rgb(var(--line))"
              strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '3 4'}
            />
            <text x={pad.left - 8} y={y(t) + 3} textAnchor="end" className="fill-muted font-mono text-[9px] tabular-nums">
              {yFormat(Math.round(t))}
            </text>
          </g>
        ))}
        {area &&
          series.map((s, si) => (
            <path key={`a-${s.name}`} d={areaPath(s.values)} fill={`url(#${gid}-fill-${si})`} />
          ))}
        {series.map((s) => (
          <path
            key={s.name}
            d={path(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.dashed ? '5 4' : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {labels.map((l, i) => (
          <g key={l}>
            <rect
              x={x(i) - 20}
              y={pad.top}
              width={40}
              height={H - pad.top - pad.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className={cx('text-[10px]', hover === i ? 'fill-ink font-semibold' : 'fill-muted')}
            >
              {l}
            </text>
          </g>
        ))}
        {series.map((s) =>
          s.values.map((v, i) =>
            hover === i ? (
              <circle key={`${s.name}-${i}`} cx={x(i)} cy={y(v)} r="3.2" fill="rgb(var(--surface))" stroke={s.color} strokeWidth="2" />
            ) : null,
          ),
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 min-w-[118px] rounded-md border border-line bg-surface px-2.5 py-2 shadow-pop animate-pop-in"
          style={{
            left: `${Math.min(72, Math.max(2, ((hover / Math.max(1, labels.length - 1)) * 100) * 0.9 + 4))}%`,
          }}
        >
          <p className="mb-1 font-display text-xs font-bold text-ink">{labels[hover]}</p>
          {series.map((s) => (
            <p key={s.name} className="flex items-center justify-between gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
              <span className="font-mono font-medium tabular-nums text-ink">{yFormat(s.values[hover])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Radial donut                                                              */
/* -------------------------------------------------------------------------- */
export function RadialGauge({
  value,
  size = 132,
  stroke = 10,
  color = 'rgb(var(--primary))',
  track = 'rgb(var(--surface-high))',
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label ?? 'Value'}: ${clamped}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.2,0.8,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[22px] font-bold leading-none tabular-nums text-ink">
          {value.toFixed(1)}%
        </span>
        {sublabel && <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Progress bar list                                                         */
/* -------------------------------------------------------------------------- */
export function BarList({
  items,
  formatValue = (v: number) => String(v),
  max,
  showRank,
}: {
  items: { label: string; value: number; color: string; meta?: string }[];
  formatValue?: (v: number) => string;
  max?: number;
  showRank?: boolean;
}) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, idx) => (
        <li key={item.label} className="group">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink">
              {showRank && <span className="w-3 font-mono text-[10px] text-muted">{idx + 1}</span>}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              {item.meta && <span className="font-mono text-[10px] tabular-nums text-muted">{item.meta}</span>}
              <span className="font-mono text-xs font-medium tabular-nums text-ink">{formatValue(item.value)}</span>
            </span>
          </div>
          <div className="h-[5px] w-full overflow-hidden rounded-full bg-surface-high">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${(item.value / top) * 100}%`, backgroundColor: item.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Histogram                                                                 */
/* -------------------------------------------------------------------------- */
export function Histogram({
  bands,
  height = 132,
  color = 'rgb(var(--primary))',
  highlight,
}: {
  bands: { band: string; count: number }[];
  height?: number;
  color?: string;
  highlight?: string;
}) {
  const max = Math.max(...bands.map((b) => b.count));
  const total = bands.reduce((a, b) => a + b.count, 0);
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {bands.map((b) => {
          const isHi = highlight === b.band;
          return (
            <div key={b.band} className="group relative flex h-full flex-1 flex-col justify-end">
              <div className="mb-1 text-center font-mono text-[9px] tabular-nums text-muted opacity-0 transition-opacity duration-120 group-hover:opacity-100">
                {b.count}
              </div>
              <div
                className="w-full origin-bottom rounded-t-[4px] transition-all duration-120 group-hover:brightness-110"
                style={{
                  height: `${Math.max(6, (b.count / max) * 100)}%`,
                  background: isHi ? color : `color-mix(in srgb, ${color} 55%, transparent)`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-full" title={`${b.band} — ${b.count}`} />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {bands.map((b) => (
          <div key={b.band} className="flex-1 text-center font-mono text-[9px] tracking-tight text-muted">
            {b.band}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">
        {total.toLocaleString('en-IN')} students on record · hover a band for counts
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sparkline                                                                 */
/* -------------------------------------------------------------------------- */
export function Sparkline({
  values,
  color = 'rgb(var(--primary))',
  width = 72,
  height = 26,
  fill = true,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const gid = useId().replace(/:/g, '');
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 2) + 1;
    const y = height - 2 - ((v - min) / Math.max(1, max - min)) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && (
        <path d={`M${pts.join(' L')} L${width - 1},${height} L1,${height} Z`} fill={`url(#spark-${gid})`} />
      )}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stacked bar (4-state grid)                                                */
/* -------------------------------------------------------------------------- */
export function StackedBar({
  segments,
  height = 8,
}: {
  segments: { value: number; color: string; label: string }[];
  height?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div
      className="flex w-full gap-[3px] overflow-hidden rounded-full"
      style={{ height }}
      role="img"
      aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}
    >
      {segments.map((s) => (
        <div
          key={s.label}
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          title={`${s.label}: ${s.value}`}
        />
      ))}
    </div>
  );
}

export const useChartColors = () =>
  useMemo(
    () => ({
      primary: '#4F46E5',
      primarySoft: '#8B87F5',
      teal: '#0D9488',
      amber: '#D97706',
      rose: '#BE185D',
      blue: '#1D4ED8',
      green: '#15803D',
      slate: '#64748B',
      violet: '#8B5CF6',
    }),
    [],
  );
