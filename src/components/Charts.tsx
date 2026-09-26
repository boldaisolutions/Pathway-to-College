import type { Category } from "@/lib/types";

/**
 * Hand-rolled SVG charts ported from the prototype's logic class
 * (`ringMini`, `heroRingEl`, `bigRingEl`, `radarEl`, `trendEl`).
 */

/** Small labelled progress ring (e.g. AI-match score). */
export function RingMini({
  value,
  color,
  size = 46,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const sw = 5;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#eeede9" strokeWidth={sw} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text
        x={cx}
        y={cx + 4}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="#2c313a"
        fontFamily="Plus Jakarta Sans"
      >
        {value}
      </text>
    </svg>
  );
}

/** White ring on the indigo dashboard hero. */
export function HeroRing({
  value,
  stroke = 11,
  track = "rgba(255,255,255,.2)",
  size = 132,
}: {
  value: number;
  stroke?: number;
  track?: string;
  size?: number;
}) {
  const sw = stroke;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={sw} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="#ffffff"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
    </svg>
  );
}

/** Large gradient ring on the Pathway Score screen. */
export function BigRing({ value }: { value: number }) {
  const size = 200;
  const sw = 16;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="pwbig" x1={0} y1={0} x2={1} y2={1}>
          <stop offset={0} stopColor="#c7d2fe" />
          <stop offset={1} stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.2)"
        strokeWidth={sw}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="url(#pwbig)"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
    </svg>
  );
}

/** 9-axis radar of the pathway categories. */
export function Radar({ cats }: { cats: Category[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const R = 96;
  const n = cats.length;
  const pt = (i: number, rad: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  };
  const dataPts = cats.map((c, i) => pt(i, (R * c.score) / 100).join(",")).join(" ");
  return (
    <svg
      width="100%"
      height={size + 20}
      viewBox={`-30 -10 ${size + 60} ${size + 20}`}
    >
      {[0.25, 0.5, 0.75, 1].map((g, gi) => (
        <polygon
          key={`g${gi}`}
          points={cats.map((_, i) => pt(i, R * g).join(",")).join(" ")}
          fill="none"
          stroke="#eceaf6"
          strokeWidth={1}
        />
      ))}
      {cats.map((_, i) => {
        const p = pt(i, R);
        return (
          <line key={`a${i}`} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#f0eef8" strokeWidth={1} />
        );
      })}
      <polygon
        points={dataPts}
        fill="rgba(79,70,229,.14)"
        stroke="#4f46e5"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {cats.map((c, i) => {
        const p = pt(i, (R * c.score) / 100);
        return <circle key={`d${i}`} cx={p[0]} cy={p[1]} r={2.6} fill="#4f46e5" />;
      })}
      {cats.map((c, i) => {
        const p = pt(i, R + 16);
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const anchor =
          Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <text
            key={`l${i}`}
            x={p[0]}
            y={p[1] + 3}
            textAnchor={anchor}
            fontSize={9.5}
            fontWeight={600}
            fill="#9097a0"
            fontFamily="JetBrains Mono"
          >
            {c.short}
          </text>
        );
      })}
    </svg>
  );
}

/** Score-over-time trend line with a goal marker. */
export function Trend({
  hist,
  goal,
}: {
  hist: { m: string; v: number }[];
  goal: number;
}) {
  const w = 330;
  const ht = 150;
  const pl = 8;
  const pr = 8;
  const pTop = 14;
  const pb = 26;
  const iw = w - pl - pr;
  const ih = ht - pTop - pb;
  const n = hist.length;
  const x = (i: number) => pl + (i / (n - 1)) * iw;
  const y = (v: number) => ht - pb - (v / 100) * ih;
  const linePts = hist.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const areaPath =
    `M ${x(0)},${ht - pb} ` +
    hist.map((d, i) => `L ${x(i)},${y(d.v)}`).join(" ") +
    ` L ${x(n - 1)},${ht - pb} Z`;
  const gy = y(goal);
  return (
    <svg width="100%" height={ht} viewBox={`0 0 ${w} ${ht}`}>
      <defs>
        <linearGradient id="pwtrend" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="rgba(79,70,229,.18)" />
          <stop offset={1} stopColor="rgba(79,70,229,0)" />
        </linearGradient>
      </defs>
      <line
        x1={pl}
        y1={gy}
        x2={w - pr}
        y2={gy}
        stroke="#f59e0b"
        strokeWidth={1.4}
        strokeDasharray="4 4"
      />
      <text
        x={w - pr}
        y={gy - 5}
        textAnchor="end"
        fontSize={9.5}
        fontWeight={700}
        fill="#d97706"
        fontFamily="JetBrains Mono"
      >
        {`goal ${goal}`}
      </text>
      <path d={areaPath} fill="url(#pwtrend)" />
      <polyline
        points={linePts}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {hist.map((d, i) => (
        <circle
          key={`p${i}`}
          cx={x(i)}
          cy={y(d.v)}
          r={i === n - 1 ? 4.5 : 3}
          fill="#fff"
          stroke="#4f46e5"
          strokeWidth={2}
        />
      ))}
      {hist.map((d, i) => (
        <text
          key={`m${i}`}
          x={x(i)}
          y={ht - 8}
          textAnchor="middle"
          fontSize={9.5}
          fill="#aab2bd"
          fontFamily="JetBrains Mono"
        >
          {d.m}
        </text>
      ))}
    </svg>
  );
}
