function HudChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 h-9 rounded-full bg-[hsl(var(--hud-chip))]/80 backdrop-blur-sm flex items-center gap-2 text-sm shadow-[0_4px_10px_hsl(0_0%_0%/.35)] border border-white/5">
      <span className="opacity-90">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function HudBar() {
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <HudChip label="ES" value="10" />
      <HudChip label="🔥" value="7" />
      <HudChip label="💎" value="197" />
      <HudChip label="❤" value="5" />
    </div>
  );
}
