import { useState, useCallback } from "react";
import HubScene from "./HubScene";
import MoodButton from "./MoodButton";
import PhaserGame from "@/game/PhaserGame";
import VirtualJoystick from "./VirtualJoystick";
import ActionButton from "./ActionButton";
import WorldOverlayRouter, { type OverlayId } from "./WorldOverlayRouter";

export default function MindWorldDashboard() {
  const [vec, setVec] = useState({ x: 0, y: 0 });
  const [actionTick, setActionTick] = useState(0);
  const [overlay, setOverlay] = useState<OverlayId | null>(null);

  const handleEnter = useCallback((id: OverlayId) => setOverlay(id), []);

  return (
    <section className="w-full h-full">
      <HubScene>
        {/* Top bar */}
        <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Your Mind World</div>
          <MoodButton />
        </div>

        {/* Phaser side-scrolling world */}
        <div className="absolute inset-0">
          <PhaserGame inputVec={vec} actionTick={actionTick} overlayId={overlay} onEnter={handleEnter} />
        </div>

        {/* Mobile controls */}
        <VirtualJoystick onChange={setVec} />
        <ActionButton label="Action" onPress={() => setActionTick((t) => t + 1)} />

        {/* Overlays */}
        <WorldOverlayRouter id={overlay} onClose={() => setOverlay(null)} />
      </HubScene>
    </section>
  );
}
