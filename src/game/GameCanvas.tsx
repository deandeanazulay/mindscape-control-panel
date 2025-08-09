import { useEffect, useMemo, useRef, useState } from "react";
import type { OverlayId } from "@/components/mindworld/WorldOverlayRouter";

type Vec2 = { x: number; y: number };

const WORLD_WIDTH = 3600;

const portals: { x: number; id: OverlayId; label: string }[] = [
  { x: 400, id: "focus", label: "Training Grounds" },
  { x: 900, id: "mentor", label: "Mind Temple" },
  { x: 1400, id: "library", label: "Sound Studio" },
  { x: 1900, id: "library", label: "Idea Forest" },
  { x: 2450, id: "library", label: "Memory Vault" },
  { x: 3000, id: "analyze", label: "Arena" },
];

export default function GameCanvas({ inputVec, actionTick, overlayId, onEnter }: { inputVec: Vec2; actionTick: number; overlayId: OverlayId | null; onEnter: (id: OverlayId) => void; }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [vw, setVw] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [vh, setVh] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 720);

  // Player state
  const xRef = useRef<number>(120);
  const vRef = useRef<number>(0);
  const [x, setX] = useState<number>(xRef.current);
  const lastAction = useRef<number>(actionTick);

  const nearest = useMemo(() => {
    let best: { id: OverlayId; x: number; d: number; label: string } | null = null;
    for (const p of portals) {
      const d = Math.abs(p.x - x);
      if (!best || d < best.d) best = { id: p.id, x: p.x, d, label: p.label } as any;
    }
    return best;
  }, [x]);

  // Resize
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Movement loop
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const paused = !!overlayId;
      const inputX = paused ? 0 : Math.max(-1, Math.min(1, inputVec.x || 0));
      // simple acceleration/friction
      vRef.current += inputX * 1.8;
      vRef.current *= 0.88;
      // clamp
      if (vRef.current > 6) vRef.current = 6; if (vRef.current < -6) vRef.current = -6;
      xRef.current = Math.max(0, Math.min(WORLD_WIDTH, xRef.current + vRef.current));
      // commit to state at lower rate
      setX((prev) => (Math.abs(prev - xRef.current) > 0.25 ? xRef.current : prev));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inputVec.x, overlayId]);

  // Handle action presses
  useEffect(() => {
    if (actionTick === lastAction.current) return;
    lastAction.current = actionTick;
    // Enter if close to a portal
    if (nearest && nearest.d < 48) {
      onEnter(nearest.id);
    }
  }, [actionTick, nearest, onEnter]);

  // Camera offset keeps player near middle
  const offsetX = useMemo(() => {
    const center = vw / 2;
    const min = 0; const max = WORLD_WIDTH - vw;
    const cam = Math.max(min, Math.min(max, x - center));
    return -cam;
  }, [x, vw]);

  return (
    <div className="absolute inset-0" aria-label="CSS World Canvas">
      {/* Ground */}
      <div className="world-ground" />

      {/* Track and buildings */}
      <div ref={trackRef} className="world-track" style={{ width: WORLD_WIDTH, transform: `translate3d(${offsetX}px, 0, 0)` }}>
        {/* Buildings / portals */}
        {portals.map((p) => {
          const near = Math.abs(p.x - x) < 48;
          return (
            <div key={p.label} className="building" style={{ left: p.x - 110 }}>
              <div className="label">{p.label}</div>
              <div className={`door ${near ? 'glow' : ''}`} />
              {near && <div className="hint">Press Action to Enter</div>}
            </div>
          );
        })}

        {/* Player */}
        <div className="player" style={{ left: x - 40 }}>
          <div className="avatar-blob relative idle-float">
            <div className="av-head" />
            <div className="av-body" />
            <div className="av-ball" />
          </div>
        </div>
      </div>

      {/* Foreground particles */}
      <div className="parallax-foreground" aria-hidden />
    </div>
  );
}
