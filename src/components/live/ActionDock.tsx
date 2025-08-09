import { Button } from "@/components/ui/button";

export default function ActionDock({ onStart, onAnalyze }: { onStart: () => void; onAnalyze: () => void }) {
  return (
    <div className="fixed inset-x-0" style={{ bottom: `calc(env(safe-area-inset-bottom) + 12px)` }}>
      <div className="mx-auto max-w-3xl px-4 pointer-events-none">
        <div className="pointer-events-auto glass-panel rounded-2xl p-2 elev flex gap-2 justify-center">
          <Button className="h-12 rounded-xl px-5" onClick={onStart}>Start Focus Session</Button>
          <Button variant="soft" className="h-12 rounded-xl px-5" onClick={onAnalyze}>Open Analyze Tool</Button>
        </div>
      </div>
    </div>
  );
}
