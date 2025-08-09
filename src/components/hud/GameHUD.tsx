import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/game/store";
import { quickSlots } from "@/game/hud/hud.data";
import { useHUDActions } from "@/game/hud/useHUDActions";
import { EvolvingSphere } from "@/components/effects/EvolvingSphere";

export function GameHUD() {
  const stats = useGameStore((s) => s.stats);
  const { run } = useHUDActions();

  // Desktop hotkeys 1..6 (preserved from legacy HUD)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, [contenteditable="true"]')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 6) {
        const slot = quickSlots[n - 1];
        if (slot) run(slot.action as any);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run]);
  return (
    <div className="fixed left-0 right-0 z-40" style={{ bottom: 0 }}>
      {/* gutter between world and HUD */}
      <div style={{ height: "var(--hud-gap)" }} />

      {/* HUD panel */}
      <div className="mx-auto max-w-6xl px-3">
        <div className="relative hud-glass p-3 md:p-4" style={{ height: "var(--hud-h)" }}>
          <span className="hud-spot" />

          {/* Layout: desktop row, mobile two lines */}
          <div className="grid h-full gap-3 md:grid-cols-[1.2fr,1fr,1.1fr] grid-rows-[1fr_auto] md:grid-rows-1">
            {/* Left: identity + bars */}
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <EvolvingSphere size={44} level={stats.level} xpPct={stats.xp} mood="focused" />
                <div className="min-w-0">
                  <div className="text-[13px] text-white/70">
                    Lv. {stats.level} · Streak {stats.streak} 🔥 · Mind Wizard
                  </div>
                  <div className="text-[15px] font-semibold text-white truncate">
                    Dean
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div className="text-[11px] text-white/60">HP</div>
                <div className="bar"><i style={{ width: `${stats.hp}%`, background: `hsl(var(--hp))` }} /></div>

                <div className="text-[11px] text-white/60 pt-1">MP</div>
                <div className="bar"><i style={{ width: `${stats.mp}%`, background: `hsl(var(--mp))` }} /></div>

                <div className="text-[11px] text-white/60 pt-1">XP</div>
                <div className="bar"><i style={{ width: `${stats.xp}%`, background: `hsl(var(--xp))` }} /></div>
              </div>
            </div>

            {/* Middle: quick actions */}
            <div className="flex items-end md:items-center justify-center">
              <div className="grid grid-cols-6 gap-3 w-full md:max-w-none">
                {quickSlots.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => run(a.action as any)}
                    className={cn(
                      "group relative aspect-square rounded-xl hud-glass",
                      "grid place-items-center text-white/90",
                      "transition-transform hover:scale-[1.03] active:scale-95"
                    )}
                    aria-label={a.label}
                  >
                    {a.icon ? (
                      <i className={cn("hud-glyph", a.icon)} />
                    ) : (
                      <div className="text-[18px] md:text-[20px]">{a.key}</div>
                    )}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[11px] text-white/80 bg-black/30 px-1.5 py-[2px] rounded-md">
                      {a.key}
                    </div>
                    <div className="absolute -bottom-5 text-[11px] text-white/70">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-start md:items-center justify-end gap-2">
              <HUDIcon label="Inventory" />
              <HUDIcon label="Map" onClick={() => run('openMap' as any)} />
              <HUDIcon label="Chat" />
              <HUDIcon label="Aurora" glow />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HUDIcon({ label, glow, onClick }: { label: string; glow?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="relative h-10 w-10 rounded-xl hud-glass grid place-items-center text-white/90 hover:scale-[1.03] active:scale-95 transition">
      {glow && <span className="absolute inset-0 rounded-xl ring-2 ring-sky-400/50 animate-pulse" />}
      <span className="text-[14px]">·</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
