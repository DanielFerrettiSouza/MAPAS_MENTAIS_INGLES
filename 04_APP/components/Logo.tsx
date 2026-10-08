// Marca do Mapas Falantes: balão de fala com ondas de som, em degradê rosa→laranja.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="mf-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff2d6f" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#mf-grad)" />
      <path
        d="M11 12h18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9l-5 4v-4h-4a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z"
        fill="#fff"
      />
      <path d="M16 17.5v4M20 16v7M24 18v3" stroke="#ff2d6f" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-text" style={{ fontSize: size * 0.72 }}>
        mapas<b>falantes</b>
      </span>
    </span>
  );
}
