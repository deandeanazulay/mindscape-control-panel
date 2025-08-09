
import { useEffect, useState } from "react";
import HypnosisLauncher from "@/components/hypnosis/HypnosisLauncher";
import { useGameStore } from "@/game/store";
import { REWARDS } from "@/game/QuestEngine";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/integrations/supabase/gameSync";

export default function HypnoPanel() {
  const [open, setOpen] = useState(false);
  const awardXP = useGameStore(s => s.awardXP);
  const completeQuest = useGameStore(s => s.completeQuest);
  const mood = useGameStore(s => s.mood);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('open-hypno-panel', h as any);
    return () => window.removeEventListener('open-hypno-panel', h as any);
  }, []);

  if (!open) return null;

  const onStart = async () => {
    // Local: complete quest + award XP
    completeQuest('start-hypno');
    awardXP(REWARDS.completeQuest);

    // Server: create a session start row (if signed-in)
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (uid) {
      supabase.from("sessions").insert({
        user_id: uid,
        type: "hypno",
        mood_before: mood,
      })
      .then(() => logEvent("session_start", { type: "hypno" }))
      .catch((e) => console.error("[HypnoPanel] session insert failed", e));
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="glass-panel rounded-t-2xl p-4 elev">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Hypno Temple</h3>
          <button className="rounded-full px-3 py-1 bg-secondary" onClick={()=>setOpen(false)}>Close</button>
        </div>
        <div className="mt-3">
          <HypnosisLauncher />
        </div>
        <div className="mt-2 flex justify-end">
          <button className="rounded-full px-4 py-2 bg-primary text-primary-foreground" onClick={onStart}>Start Session</button>
        </div>
      </div>
    </div>
  );
}
