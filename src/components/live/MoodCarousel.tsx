import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const MOODS = [
  { key: "calm", label: "Calm", emoji: "😌" },
  { key: "confident", label: "Confident", emoji: "💪" },
  { key: "focused", label: "Focused", emoji: "🎯" },
  { key: "tired", label: "Tired", emoji: "😴" },
  { key: "stressed", label: "Stressed", emoji: "😵‍💫" },
];

export function MoodCarousel() {
  const [active, setActive] = useState<string>("focused");

  useEffect(() => {
    try {
      const m = localStorage.getItem("mood.last");
      if (m) setActive(m.toLowerCase());
    } catch {}
  }, []);

  const onSelect = (k: string) => {
    setActive(k);
    try { localStorage.setItem("mood.last", k.charAt(0).toUpperCase() + k.slice(1)); } catch {}
  };

  const items = useMemo(() => MOODS, []);

  return (
    <div className="glass-panel rounded-xl p-3 elev">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Mood</span>
      </div>
      <div className="flex gap-2 overflow-x-auto py-1">
        {items.map((m) => (
          <Button
            key={m.key}
            size="sm"
            variant={active === m.key ? "solid" : "soft"}
            className={`rounded-full px-3 py-2 transition-transform motion-safe:active:scale-95 ${active === m.key ? 'ring-2 ring-[hsl(var(--ring))]' : ''}`}
            onClick={() => onSelect(m.key)}
            aria-pressed={active === m.key}
          >
            <span className="mr-1" aria-hidden> {m.emoji} </span>
            {m.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
