import { useState, useCallback, useEffect } from "react";
import HubScene from "./HubScene";
import MoodButton from "./MoodButton";
import PhaserGame from "@/game/PhaserGame";
import VirtualJoystick from "./VirtualJoystick";
import ActionButton from "./ActionButton";
import WorldOverlayRouter, { type OverlayId } from "./WorldOverlayRouter";
import HUDBar from "@/game/hud/HUDBar";

export default function MindWorldDashboard() {
  const [vec, setVec] = useState({ x: 0, y: 0 });
  const [actionTick, setActionTick] = useState(0);
  const [overlay, setOverlay] = useState<OverlayId | null>(null);

  const handleEnter = useCallback((id: OverlayId) => setOverlay(id), []);

  // Listen to global HUD quick actions and open overlays accordingly
  useEffect(() => {
    const set = (id: OverlayId | null) => setOverlay(id);
    const onFocus = () => set('focus');
    const onHypno = () => set('mentor');
    const onVoice = () => set('library');
    const onNote = () => set('library');
    const onAnalyze = () => set('analyze');
    const onMap = () => set(null);

    document.addEventListener('mos:startFocus' as any, onFocus as any);
    document.addEventListener('mos:startHypnosis' as any, onHypno as any);
    document.addEventListener('mos:voiceNote' as any, onVoice as any);
    document.addEventListener('mos:addNote' as any, onNote as any);
    document.addEventListener('mos:openAnalyze' as any, onAnalyze as any);
    document.addEventListener('mos:openMap' as any, onMap as any);

    return () => {
      document.removeEventListener('mos:startFocus' as any, onFocus as any);
      document.removeEventListener('mos:startHypnosis' as any, onHypno as any);
      document.removeEventListener('mos:voiceNote' as any, onVoice as any);
      document.removeEventListener('mos:addNote' as any, onNote as any);
      document.removeEventListener('mos:openAnalyze' as any, onAnalyze as any);
      document.removeEventListener('mos:openMap' as any, onMap as any);
    };
  }, []);

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
        {/* HUD overlay */}
        <HUDBar />
      </HubScene>
    </section>
  );
}
