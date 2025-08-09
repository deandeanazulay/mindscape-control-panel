
import { Progress } from "@/components/ui/progress";

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="glass-panel rounded-xl p-4 elev">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Today's Progress</div>
        <div className="text-xs text-muted-foreground">{clamped}%</div>
      </div>
      <div className="mt-2">
        <Progress value={clamped} />
      </div>
    </div>
  );
}
