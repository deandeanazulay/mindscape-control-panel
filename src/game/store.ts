import { create } from "zustand";

export type Stats = { hp: number; mp: number; xp: number; level: number; streak: number };
export type GameState = {
  pos: { x: number; y: number };
  stats: Stats;
  mood: "Calm" | "Focused" | "Confident" | "Stressed" | "Tired";
  quests: Record<string, boolean>;
  setPos: (x: number, y: number) => void;
  setMood: (m: GameState["mood"]) => void;
  awardXP: (amount: number) => void;
  completeQuest: (id: string) => void;
  incStreak: () => void;
  resetDaily: () => void;
};

const defaults: GameState = {
  pos: { x: 160, y: 820 },
  stats: { hp: 78, mp: 62, xp: 35, level: 7, streak: 1 },
  mood: "Focused",
  quests: {},
  setPos() {},
  setMood() {},
  awardXP() {},
  completeQuest() {},
  incStreak() {},
  resetDaily() {},
};

export const useGameStore = create<GameState>((set, get) => {
  let init = defaults;
  try {
    const raw = localStorage.getItem("mos.store");
    if (raw) init = { ...defaults, ...JSON.parse(raw) };
    const m = localStorage.getItem("mood.last");
    if (m) init.mood = (m || "Focused").charAt(0).toUpperCase() + (m || "Focused").slice(1).toLowerCase() as GameState["mood"]; // normalize
  } catch {}

  const persist = (partial: Partial<GameState>) => {
    set(partial as any);
    try {
      const next = { ...get(), ...partial } as GameState;
      localStorage.setItem("mos.store", JSON.stringify(next));
    } catch {}
  };

  return {
    ...init,
    setPos: (x, y) => persist({ pos: { x, y } }),
    setMood: (m) => persist({ mood: m }),
    awardXP: (amount) => {
      const s = get().stats;
      const total = s.xp + amount;
      const addLevels = Math.floor(total / 100);
      const xp = total % 100;
      const level = s.level + addLevels;
      persist({ stats: { ...s, xp, level } });
      // Sparkle + light haptics
      try { if (navigator.vibrate) navigator.vibrate(12); } catch {}
      window.dispatchEvent(new CustomEvent("xp-sparkle", { detail: { amount } }));
    },
    completeQuest: (id) => persist({ quests: { ...get().quests, [id]: true } }),
    incStreak: () => {
      const s = get().stats;
      persist({ stats: { ...s, streak: s.streak + 1 } });
    },
    resetDaily: () => persist({ quests: {} }),
  };
});
