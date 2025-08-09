import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GameHUD } from "@/components/hud/GameHUD";
import WorldOverlayRouter, { type OverlayId } from "@/components/mindworld/WorldOverlayRouter";
import { EmbedPane } from "./EmbedPane";

export default function BrowserShell() {
  const [url, setUrl] = useState<string>("");
  const [current, setCurrent] = useState<string>("");
  const [overlay, setOverlay] = useState<OverlayId | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // SEO basics
  useEffect(() => {
    document.title = "Aurora OS – Browser Overlay & Focus HUD";
    const m = document.querySelector('meta[name="description"]');
    const text = "Always-on HUD with hypnosis & focus sessions that works on any site.";
    if (m) m.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
    // canonical
    const link = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", window.location.href);
    if (!link.parentElement) document.head.appendChild(link);
  }, []);

  // Handle quick actions from HUD
  useEffect(() => {
    const map: Record<string, OverlayId> = {
      "mos:startFocus": "focus",
      "mos:startHypnosis": "mentor",
      "mos:openAnalyze": "analyze",
      "mos:openMap": "library",
    } as const;
    const handler = (e: Event) => {
      const id = map[(e as CustomEvent).type];
      if (id) setOverlay(id);
    };
    Object.keys(map).forEach((name) => document.addEventListener(name, handler as any));
    return () => {
      Object.keys(map).forEach((name) => document.removeEventListener(name, handler as any));
    };
  }, []);

  // esc to close overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && overlay) { e.preventDefault(); setOverlay(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay]);

  const navigate = (next: string) => {
    try {
      const trimmed = next.trim();
      if (!trimmed) return;
      const withProto = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      setCurrent(withProto);
    } catch {}
  };

  const presets = useMemo(() => [
    { label: "Notion", href: "https://www.notion.so/" },
    { label: "Google Docs", href: "https://docs.google.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ], []);

  return (
    <div className="w-full h-full flex flex-col" style={{ paddingBottom: "calc(var(--hud-h, 112px) + var(--hud-gap, 8px) + env(safe-area-inset-bottom))" }}>
      {/* Header */}
      <header className="glass-panel elev rounded-b-xl px-3 md:px-4 py-2 sticky top-0 z-30">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-sm md:text-base font-semibold">Aurora OS</div>
          <form
            className="flex-1 flex items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); navigate(url); }}
          >
            <Input
              ref={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a site (e.g., notion.so)"
              className="h-9"
              aria-label="Site URL"
            />
            <Button type="submit" size="sm">Go</Button>
          </form>
          <Button variant="secondary" size="sm" onClick={() => (window.location.href = "/extension")}>Extension</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button key={p.href} size="sm" variant="secondary" onClick={() => { setUrl(p.href); navigate(p.href); }}>
              {p.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0">
        <EmbedPane url={current} />
      </main>

      {/* HUD */}
      <GameHUD />

      {/* Overlays */}
      <WorldOverlayRouter id={overlay} onClose={() => setOverlay(null)} />
    </div>
  );
}
