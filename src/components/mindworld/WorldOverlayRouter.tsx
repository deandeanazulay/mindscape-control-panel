import { PropsWithChildren } from "react";
import RoadmapsManager from "@/components/control/RoadmapsManager";
import ArchivePanel from "@/components/archive/ArchivePanel";
import { MoodCarousel } from "@/components/live/MoodCarousel";
import QuestBoard from "./QuestBoard";

export type OverlayId = "mentor" | "library" | "garden" | "focus" | "analyze";

function OverlayShell({ title, children, onClose }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 p-4 grid place-items-center">
        <section className="w-full max-w-4xl h-[80vh] glass-panel rounded-2xl elev overflow-hidden">
          <header className="px-4 py-3 flex items-center justify-between border-b border-border/60">
            <h1 className="text-lg font-semibold leading-none">{title}</h1>
            <button onClick={onClose} className="text-sm text-muted-foreground hover:opacity-80">Close</button>
          </header>
          <main className="p-4 h-[calc(80vh-56px)] overflow-auto">
            {children}
          </main>
        </section>
      </div>
    </div>
  );
}

export default function WorldOverlayRouter({ id, onClose }: { id: OverlayId | null; onClose: () => void }) {
  if (!id) return null;
  if (id === "focus") {
    return (
      <OverlayShell title="Hall of Focus" onClose={onClose}>
        <RoadmapsManager />
      </OverlayShell>
    );
  }
  if (id === "library") {
    return (
      <OverlayShell title="Library of Wins" onClose={onClose}>
        <ArchivePanel />
      </OverlayShell>
    );
  }
  if (id === "garden") {
    return (
      <OverlayShell title="Mood Garden" onClose={onClose}>
        <div className="max-w-md mx-auto">
          <MoodCarousel />
        </div>
      </OverlayShell>
    );
  }
  if (id === "mentor") {
    return (
      <OverlayShell title="Mentor" onClose={onClose}>
        <div className="max-w-xl mx-auto">
          <QuestBoard />
        </div>
      </OverlayShell>
    );
  }
  // analyze
  return (
    <OverlayShell title="Analyze Lab" onClose={onClose}>
      <div className="glass-panel rounded-xl p-4">
        <p className="text-sm text-muted-foreground">Analyze Tool is coming soon. You will be able to send tasks and notes here for insights.</p>
      </div>
    </OverlayShell>
  );
}
