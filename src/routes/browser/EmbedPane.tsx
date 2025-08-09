import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function EmbedPane({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  const [assumedBlocked, setAssumedBlocked] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setLoaded(false);
    setAssumedBlocked(false);
    if (!url) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!loaded) setAssumedBlocked(true);
    }, 2500);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [url]);

  if (!url) {
    return (
      <section className="h-full grid place-items-center">
        <div className="glass-panel rounded-2xl p-6 max-w-xl text-center">
          <h1 className="text-xl font-semibold">Open any site with Aurora</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter a URL above or pick a preset. Your HUD stays on, with hypnosis and focus sessions a click away.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="relative h-full">
      <iframe
        title="Aurora Embedded Site"
        src={url}
        className="absolute inset-0 w-full h-full rounded-none"
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
        onLoad={() => setLoaded(true)}
      />

      {/* Fallback if the site blocks embedding */}
      {!loaded && assumedBlocked && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="glass-panel rounded-xl p-5 text-center max-w-md">
            <h2 className="font-semibold">This site blocks embedding</h2>
            <p className="text-sm text-muted-foreground mt-2">Open it normally and use the Aurora Companion extension to overlay the HUD on any page.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button size="sm" onClick={() => window.open(url, "_blank")}>Open Site</Button>
              <Button size="sm" variant="secondary" onClick={() => (window.location.href = "/extension")}>Get Extension</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
