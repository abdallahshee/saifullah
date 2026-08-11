export function AnimatedLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full bg-[var(--brand-gold)] motion-safe:animate-[logo-tick_0.6s_ease-out_forwards,logo-pulse_3s_ease-in-out_1s_infinite]"
        aria-hidden="true"
      />
      <span className="font-serif text-lg text-white motion-safe:animate-[fade-in_0.6s_ease-out_0.15s_both]">
        Saifullah Integrated Academy
      </span>
    </span>
  );
}