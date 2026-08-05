import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <BrandPanel />

      <div className="flex items-center justify-center bg-[var(--paper)] px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-2)] px-12 py-14 lg:flex lg:flex-col lg:justify-between">
      <RollGrid />

      <div className="relative z-10 font-mono text-xs tracking-[0.2em] text-[var(--brand-gold)]">
        STAFF &amp; FAMILY PORTAL
      </div>

      <div className="relative z-10 max-w-sm">
        <h1 className="font-serif text-4xl leading-tight text-white">
          Every child,
          <br />
          accounted for.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Sign in to manage admissions, rosters, and daily attendance.
        </p>
      </div>
    </div>
  );
}

// A quiet roll-call grid: rows of dots, a few "marked present" in gold along
// a diagonal — a direct nod to attendance-marking rather than decoration.
function RollGrid() {
  const cols = 12;
  const rows = 8;
  const dots = Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const marked = col === row + 2 || col === row + 3;
    return { col, row, marked };
  });

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      viewBox={`0 0 ${cols * 32} ${rows * 32}`}
      aria-hidden="true"
    >
      {dots.map(({ col, row, marked }, i) => (
        <circle
          key={i}
          cx={col * 32 + 16}
          cy={row * 32 + 16}
          r={marked ? 3.5 : 2}
          fill={marked ? "var(--brand-gold)" : "rgba(255,255,255,0.12)"}
        />
      ))}
    </svg>
  );
}