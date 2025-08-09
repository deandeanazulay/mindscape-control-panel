import { toast } from "@/hooks/use-toast";
import HubScene from "./HubScene";
import XPTotem from "./XPTotem";
import AvatarIdle from "./AvatarIdle";
import QuestBoard from "./QuestBoard";
import MoodButton from "./MoodButton";
import ActionDock from "@/components/live/ActionDock";

export default function MindWorldDashboard() {
  return (
    <section className="w-full h-full">
      <HubScene>
        {/* Top bar */}
        <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Your Mind World</div>
          <MoodButton />
        </div>

        {/* Center stage */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            <AvatarIdle />
            <XPTotem />
          </div>
        </div>

        {/* Quest board (bottom area) */}
        <div className="absolute inset-x-0 bottom-24 px-4">
          <QuestBoard />
        </div>

        {/* Floating action dock */}
        <ActionDock
          onStart={() => toast({ title: "Hypnosis Session", description: "Starting soon." })}
          onAnalyze={() => toast({ title: "Analyze Tool", description: "Opening soon." })}
          onNotes={() => toast({ title: "Voice Notes", description: "Capture ideas hands-free soon." })}
          onVoice={() => toast({ title: "Voice", description: "Recorder coming soon." })}
        />
      </HubScene>
    </section>
  );
}
