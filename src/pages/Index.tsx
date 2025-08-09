import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AuthMenu } from "@/components/auth/AuthMenu";
import RoadmapsManager from "@/components/control/RoadmapsManager";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import LiveFocusView from "@/components/live/LiveFocusView";

type PanelKey = "live" | "archive" | "control" | "create" | "analyze";

const panelMap: Record<PanelKey, { grid: [number, number]; title: string; subtitle: string } > = {
  live: { grid: [1,1], title: "Live", subtitle: "Capture moments: photo, video, text, audio" },
  archive: { grid: [0,1], title: "Archive", subtitle: "Skills, Memories, Achievements, Lessons, Relationships" },
  control: { grid: [2,1], title: "Control", subtitle: "Goals: Title, Why, Next Action, Review" },
  create: { grid: [1,0], title: "Create", subtitle: "Guided prompts to capture ideas" },
  analyze: { grid: [1,2], title: "Analyze", subtitle: "Decision tools: If–Then, Pros/Cons, One Metric" },
};

function useSwipeNavigation() {
  const [pos, setPos] = useState<[number, number]>([1, 1]); // x,y in 0..2
  const [lastMove, setLastMove] = useState<"left" | "right" | "up" | "down" | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const threshold = 50; // px

  const current: PanelKey = useMemo(() => {
    const entries = Object.entries(panelMap) as [PanelKey, typeof panelMap.live][];
    const found = entries.find(([, cfg]) => cfg.grid[0] === pos[0] && cfg.grid[1] === pos[1]);
    return found?.[0] ?? "live";
  }, [pos]);

  const moveLeft = () => {
    setLastMove("left");
    setPos((p) => [Math.max(0, p[0] - 1), p[1]]);
  };
  const moveRight = () => {
    setLastMove("right");
    setPos((p) => [Math.min(2, p[0] + 1), p[1]]);
  };
  const moveUp = () => {
    setLastMove("up");
    setPos((p) => [p[0], Math.max(0, p[1] - 1)]);
  };
  const moveDown = () => {
    setLastMove("down");
    setPos((p) => [p[0], Math.min(2, p[1] + 1)]);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    // Horizontal swipe dominates if greater absolute movement
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) moveRight(); else moveLeft();
    } else {
      if (dy < 0) moveDown(); else moveUp();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === "ArrowUp") moveUp();
      if (e.key === "ArrowDown") moveDown();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { pos, onPointerDown, onPointerUp, current, lastMove, moveLeft, moveRight, moveUp, moveDown };
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="px-6 pt-8">
      <div className="glass-panel rounded-xl p-5 elev">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </header>
  );
}

function LivePanel() {
  // Render the new Live Focus experience
  return (
    <section className="w-full h-full flex flex-col">
      <LiveFocusView />
    </section>
  );
}

function ArchivePanel() {
  const folders = ["Skills","Memories","Achievements","Lessons","Relationships"];
  return (
    <section className="w-full h-full flex flex-col">
      <PanelHeader title="Archive" subtitle="Your organized memories and references" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
        {folders.map((f)=> (
          <article key={f} className="glass-panel rounded-xl p-4 elev smooth hover:scale-[1.02]">
            <h3 className="font-semibold">{f}</h3>
            <p className="text-xs text-muted-foreground mt-1">Cards, media, and notes</p>
            <div className="mt-4">
              <Button size="sm" onClick={()=> toast({ title: f, description: "Open folder (sync later)." })}>Open</Button>
            </div>
          </article>
        ))}
      </main>
    </section>
  );
}

function ControlPanel() {
  return (
    <section className="w-full h-full flex flex-col">
      <PanelHeader title="Control" subtitle="Manage roadmaps and tasks" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <RoadmapsManager />
      </main>
    </section>
  );
}

function CreatePanel() {
  return (
    <section className="w-full h-full flex flex-col">
      <PanelHeader title="Create" subtitle="Guided prompts coming in Sprint 2" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 grid place-items-center">
        <div className="glass-panel rounded-xl p-6 text-center max-w-md">
          <p className="text-sm text-muted-foreground">Prompt packs will help you capture ideas and convert them to goals or archive cards.</p>
        </div>
      </main>
    </section>
  );
}

function AnalyzePanel() {
  return (
    <section className="w-full h-full flex flex-col">
      <PanelHeader title="Analyze" subtitle="Decision tools coming in Sprint 2" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
        {["If–Then","Pros / Cons","One Constraint","One Metric"].map((tool)=> (
          <button key={tool} onClick={()=> toast({ title: tool, description: "Will save as analysis cards linked to goals." })} className="glass-panel rounded-xl p-4 elev smooth hover:scale-[1.02] text-left">
            <span className="font-semibold">{tool}</span>
            <p className="text-xs text-muted-foreground mt-1">Tap to start</p>
          </button>
        ))}
      </main>
    </section>
  );
}

function OverlayArrows({
  pos,
  lastMove,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
}: {
  pos: [number, number];
  lastMove: "left" | "right" | "up" | "down" | null;
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
}) {
  const canLeft = pos[0] > 0;
  const canRight = pos[0] < 2;
  const canUp = pos[1] > 0;
  const canDown = pos[1] < 2;

  let onlyReverse: "left" | "right" | "up" | "down" | null = null;
  if (pos[1] === 0 && lastMove === "up") onlyReverse = "down";
  else if (pos[1] === 2 && lastMove === "down") onlyReverse = "up";
  else if (pos[0] === 0 && lastMove === "left") onlyReverse = "right";
  else if (pos[0] === 2 && lastMove === "right") onlyReverse = "left";

  const btnClass = "pointer-events-auto rounded-full glass-panel elev shadow-sm";
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* Up */}
      {(onlyReverse === "up" || (!onlyReverse && canUp)) && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Move up"
          className={`${btnClass} fixed top-4 left-1/2 -translate-x-1/2`}
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={moveUp}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      )}
      {/* Down */}
      {(onlyReverse === "down" || (!onlyReverse && canDown)) && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Move down"
          className={`${btnClass} fixed bottom-4 left-1/2 -translate-x-1/2`}
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={moveDown}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}
      {/* Left */}
      {(onlyReverse === "left" || (!onlyReverse && canLeft)) && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Move left"
          className={`${btnClass} fixed left-4 top-1/2 -translate-y-1/2`}
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={moveLeft}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
      {/* Right */}
      {(onlyReverse === "right" || (!onlyReverse && canRight)) && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Move right"
          className={`${btnClass} fixed right-4 top-1/2 -translate-y-1/2`}
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={moveRight}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

const Index = () => {
  const { pos, onPointerDown, onPointerUp, current, lastMove, moveLeft, moveRight, moveUp, moveDown } = useSwipeNavigation();

  // Signature moment: soft reactive spotlight following pointer
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX; const y = e.clientY;
      el.style.background = `radial-gradient(600px 300px at ${x}px ${y}px, hsl(var(--primary) / 0.08), transparent 50%)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const translate = `translate3d(${-pos[0]*100}vw, ${-pos[1]*100}vh, 0)`;

  return (
    <div className="w-screen h-screen overflow-hidden relative" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <header className="absolute top-4 left-4 z-10">
        <h1 className="sr-only">Mind Operating System (MOS)</h1>
      </header>

      <nav className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button variant="secondary" onClick={()=> toast({ title: "Connect Supabase", description: "Click the green Supabase button (top-right in Lovable) to enable Auth, DB & Storage." })}>Connect Supabase</Button>
        <AuthMenu />
      </nav>

      <div className="absolute inset-0 smooth" style={{ transform: translate }}>
        {/* 3x3 grid canvas sized by viewport */}
        <div className="relative" style={{ width: '300vw', height: '300vh' }}>
          {/* Place five panels */}
          <div className="absolute" style={{ left: '100vw', top: '100vh', width: '100vw', height: '100vh' }}>
            <LivePanel />
          </div>
          <div className="absolute" style={{ left: '0', top: '100vh', width: '100vw', height: '100vh' }}>
            <ArchivePanel />
          </div>
          <div className="absolute" style={{ left: '200vw', top: '100vh', width: '100vw', height: '100vh' }}>
            <ControlPanel />
          </div>
          <div className="absolute" style={{ left: '100vw', top: '0', width: '100vw', height: '100vh' }}>
            <CreatePanel />
          </div>
          <div className="absolute" style={{ left: '100vw', top: '200vh', width: '100vw', height: '100vh' }}>
            <AnalyzePanel />
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
        {/* horizontal dots */}
        <div className="flex items-center gap-2">
          {[0,1,2].map((i)=> (
            <span key={i} className={`block rounded-full smooth ${i===pos[0] ? 'bg-primary' : 'bg-muted'} ${i===pos[0] ? 'w-4 h-2' : 'w-2 h-2'}`} />
          ))}
        </div>
        {/* vertical dots */}
        <div className="flex items-center gap-2">
          {[0,1,2].map((i)=> (
            <span key={i} className={`block rounded-full smooth ${i===pos[1] ? 'bg-accent' : 'bg-muted'} ${i===pos[1] ? 'w-2 h-4' : 'w-2 h-2'}`} />
          ))}
        </div>
      </div>

      {/* Floating edge arrows */}
      <OverlayArrows
        pos={pos}
        lastMove={lastMove}
        moveLeft={moveLeft}
        moveRight={moveRight}
        moveUp={moveUp}
        moveDown={moveDown}
      />

      <footer className="absolute bottom-4 left-4 text-xs text-muted-foreground z-10">
        <span>{current.toUpperCase()}</span>
      </footer>
    </div>
  );
};

export default Index;
