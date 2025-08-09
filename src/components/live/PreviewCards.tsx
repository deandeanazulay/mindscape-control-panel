import { Card } from "@/components/ui/card";

export default function PreviewCards({ progressPercent }: { progressPercent: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card className="p-4 bg-secondary">
        <div className="text-sm font-semibold mb-1">Today's Progress</div>
        <div className="text-xs text-muted-foreground">{Math.round(progressPercent)}% complete</div>
      </Card>
      <Card className="p-4 bg-secondary">
        <div className="text-sm font-semibold mb-1">XP Progress</div>
        <div className="text-xs text-muted-foreground">Leveling up as you complete tasks</div>
      </Card>
      <Card className="p-4 bg-secondary">
        <div className="text-sm font-semibold mb-1">Voice Notes</div>
        <div className="text-xs text-muted-foreground">Capture ideas hands-free (coming soon)</div>
      </Card>
    </div>
  );
}
