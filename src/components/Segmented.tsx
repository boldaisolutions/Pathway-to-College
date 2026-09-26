"use client";

/** Segmented option row used throughout the onboarding wizard. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  columns,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0,1fr))` }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="rounded-input border px-3 py-[10px] text-[13.5px] font-semibold transition"
            style={{
              background: active ? "#4f46e5" : "#fff",
              color: active ? "#fff" : "#4a4f59",
              borderColor: active ? "#4f46e5" : "#e2e0db",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select chip row (e.g. "What do you want help with?"). */
export function MultiChips({
  values,
  options,
  onToggle,
}: {
  values: string[];
  options: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = values.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className="rounded-pill border px-[14px] py-[8px] text-[13px] font-semibold transition"
            style={{
              background: active ? "#4f46e5" : "#fff",
              color: active ? "#fff" : "#4a4f59",
              borderColor: active ? "#4f46e5" : "#e2e0db",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
