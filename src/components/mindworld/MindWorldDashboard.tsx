import { useState, useCallback, useEffect } from "react";
import HubScene from "./HubScene";

import GameCanvas from "@/game/GameCanvas";
import VirtualJoystick from "./VirtualJoystick";
import ActionButton from "./ActionButton";
import WorldOverlayRouter, { type OverlayId } from "./WorldOverlayRouter";
import HUDBar from "@/game/hud/HUDBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useGameStore } from "@/game/store";
import { REWARDS } from "@/game/QuestEngine";

export default function MindWorldDashboard() {
  const [vec, setVec] = useState({ x: 0, y: 0 });
  const [actionTick, setActionTick] = useState(0);
  const [overlay, setOverlay] = useState<OverlayId | null>(null);

  const handleEnter = useCallback((id: OverlayId) => setOverlay(id), []);

  const isMobile = useIsMobile();
  const [joyEnabled, setJoyEnabled] = useLocalStorage<boolean>("joystick.enabled", isMobile);

  // Game store actions
  const awardXP = useGameStore(s => s.awardXP);
  const completeQuest = useGameStore(s => s.completeQuest);

  // Toggle joystick via global event and persist
  useEffect(() => {
    const onToggle = () => setJoyEnabled((v) => !v);
    document.addEventListener('mos:toggleJoystick' as any, onToggle as any);
    return () => document.removeEventListener('mos:toggleJoystick' as any, onToggle as any);
  }, [setJoyEnabled]);

  // Keyboard controls (desktop)
  useEffect(() => {
    const pressed = new Set<string>();
    const updateVec = () => {
      if (overlay) return; // pause input when overlay is open
      const x = (pressed.has('right') ? 1 : 0) + (pressed.has('left') ? -1 : 0);
      setVec((v) => ({ ...v, x }));
    };
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { pressed.add('left'); updateVec(); }
      if (k === 'arrowright' || k === 'd') { pressed.add('right'); updateVec(); }
      if (k === ' ' || k === 'enter' || k === 'e') { setActionTick((t) => t + 1); }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { pressed.delete('left'); updateVec(); }
      if (k === 'arrowright' || k === 'd') { pressed.delete('right'); updateVec(); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [overlay]);

  // Listen to global HUD quick actions and open overlays accordingly + quests/XP
  useEffect(() => {
    const set = (id: OverlayId | null) => setOverlay(id);
    const onFocus = () => { set('focus'); completeQuest('pick-focus'); awardXP(REWARDS.completeQuest); };
    const onHypno = () => { set('mentor'); completeQuest('start-hypno'); awardXP(REWARDS.completeQuest); };
    const onVoice = () => { set('library'); completeQuest('record-voice'); awardXP(REWARDS.completeQuest); };
    const onNote = () => { set('library'); completeQuest('add-note'); awardXP(REWARDS.completeQuest); };
    const onAnalyze = () => { set('analyze'); completeQuest('open-analyze'); awardXP(REWARDS.completeQuest); };
    const onMap = () => { document.dispatchEvent(new CustomEvent('open-fast-travel')); };

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
  }, [awardXP, completeQuest]);

  return (
    <section className="w-full h-full">
      <HubScene>

        {/* CSS side-scrolling world */}
        <div className="absolute inset-0">
          <GameCanvas inputVec={vec} actionTick={actionTick} overlayId={overlay} onEnter={handleEnter} />
        </div>

        {/* Mobile controls */}
        {joyEnabled && <VirtualJoystick onChange={setVec} />}
        <ActionButton label="Action" onPress={() => setActionTick((t) => t + 1)} />

        {/* Overlays */}
        <WorldOverlayRouter id={overlay} onClose={() => setOverlay(null)} />
        {/* HUD overlay */}
        <HUDBar />
      </HubScene>
    </section>
  );
}
