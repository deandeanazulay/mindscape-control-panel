import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const prev = useRef(clamped);
  const [showBump, setShowBump] = useState(false);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const diff = clamped - prev.current;
    let timer: any;
    if (diff > 0) {
      setDelta(diff);
      setShowBump(true);
      timer = setTimeout(() => setShowBump(false), 1200);
    }
    prev.current = clamped;
    return () => timer && clearTimeout(timer);
  }, [clamped]);

  return (
    <div className="glass-panel rounded-xl p-4 elev relative animate-fade-in smooth">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Today's Progress</div>
      </div>
      <div className="mt-2 relative">
        <Progress value={clamped} />
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="text-xs font-medium text-secondary-foreground">{clamped}%</span>
        </div>
      </div>
      {showBump && (
        <span
          className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] bg-primary text-primary-foreground shadow-md animate-in fade-in-50 slide-in-from-top-2"
        >
          +{delta}
        </span>
      )}
    </div>
  );
}
