/** The Pathway wordmark + glyph used in the sidebar and auth screens. */
export function Logo({
  light = false,
  size = 36,
}: {
  light?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-[11px]">
      <div
        className="flex items-center justify-center rounded-[10px]"
        style={{
          width: size,
          height: size,
          background: light ? "rgba(255,255,255,.16)" : "#4f46e5",
        }}
      >
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 4 7.5v9L12 21l8-4.5v-9z"
            stroke="#fff"
            strokeWidth={1.9}
            strokeLinejoin="round"
          />
          <path
            d="M4 7.5 12 12l8-4.5M12 12v9"
            stroke="#fff"
            strokeWidth={1.9}
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        className="text-[17px] font-extrabold tracking-[-.02em]"
        style={{ color: light ? "#fff" : "#1d2129" }}
      >
        Pathway
      </div>
    </div>
  );
}
