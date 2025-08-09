import FocusFlame from "@/components/mascot/FocusFlame";
import { StreakBadge } from "@/components/live/StreakBadge";
import { XPBar } from "@/components/live/XPBar";

export default function XPTotem() {
  return (
    <div className="glass-panel rounded-2xl p-3 elev w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FocusFlame size={40} />
          <StreakBadge />
        </div>
        <span className="text-xs text-muted-foreground">XP Totem</span>
      </div>
      <div className="mt-3">
        <XPBar />
      </div>
    </div>
  );
}
