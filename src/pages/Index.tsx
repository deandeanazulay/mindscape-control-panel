import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import RoadmapsManager from "@/components/control/RoadmapsManager";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import GameHome from "@/game/path/GameHome";
import ArchivePanel from "@/components/archive/ArchivePanel";
import { FloatingAssistant } from "@/components/live/FloatingAssistant";
import AppHeader from "@/components/layout/AppHeader";
import { PanelHeaderUnified } from "@/components/layout/PanelHeaderUnified";
import DailyKickoff from "@/components/live/DailyKickoff";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LandingPage from "./LandingPage";
import { type PathNode } from "@/game/path/path.data";
import HUDBar from "@/game/hud/HUDBar";
type PanelKey = "live" | "archive" | "control" | "create" | "analyze";

const panelMap: Record<PanelKey, { grid: [number, number]; title: string; subtitle: string } > = {
  live: { grid: [1,1], title: "Live", subtitle: "Capture moments: photo, video, text, audio" },
  archive: { grid: [0,1], title: "Archive", subtitle: "Skills, Memories, Achievements, Lessons, Relationships" },
  control: { grid: [2,1], title: "Control", subtitle: "Goals: Title, Why, Next Action, Review" },
  create: { grid: [1,0], title: "Create", subtitle: "Guided prompts to capture ideas" },
  analyze: { grid: [1,2], title: "Analyze", subtitle: "Decision tools: If–Then, Pros/Cons, One Metric" },
};

// Navigation helpers based on actual occupied panels
const GRID_MIN = 0;
const GRID_MAX = 2;

function panelAt(x: number, y: number): PanelKey | null {
  const entries = Object.entries(panelMap) as [PanelKey, (typeof panelMap)[PanelKey]][];
  const found = entries.find(([, cfg]) => cfg.grid[0] === x && cfg.grid[1] === y);
  return found ? found[0] : null;
}

function nextOccupied(
  x: number,
  y: number,
  dir: "left" | "right" | "up" | "down"
): [number, number] | null {
  let cx = x;
  let cy = y;
  const stepX = dir === "left" ? -1 : dir === "right" ? 1 : 0;
  const stepY = dir === "up" ? -1 : dir === "down" ? 1 : 0;
  while (true) {
    cx += stepX;
    cy += stepY;
    if (cx < GRID_MIN || cx > GRID_MAX || cy < GRID_MIN || cy > GRID_MAX) return null;
    if (panelAt(cx, cy)) return [cx, cy];
  }
}

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

  const tryMove = (dir: "left" | "right" | "up" | "down") => {
    const next = nextOccupied(pos[0], pos[1], dir);
    if (next) {
      setLastMove(dir);
      setPos(next);
    }
  };

  const moveLeft = () => tryMove("left");
  const moveRight = () => tryMove("right");
  const moveUp = () => tryMove("up");
  const moveDown = () => tryMove("down");
  const gotoPanel = (key: PanelKey) => {
    const [x, y] = panelMap[key].grid;
    setPos([x, y]);
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

  return { pos, onPointerDown, onPointerUp, current, lastMove, moveLeft, moveRight, moveUp, moveDown, gotoPanel };
}


function LivePanel({ onManageRoadmaps, onNodeClick, onNavSelect }: { onManageRoadmaps?: () => void; onNodeClick?: (node: PathNode) => void; onNavSelect?: (key: 'home'|'map'|'live'|'rank'|'aurora') => void }) {
  // Render the new Duolingo-style path home
  return (
    <section className="w-full h-full flex flex-col">
      <GameHome onNodeClick={onNodeClick} onNavSelect={onNavSelect} />
    </section>
  );
}


function ControlPanel() {
  return (
    <section className="w-full h-full flex flex-col">
      <PanelHeaderUnified title="Control" subtitle="Manage roadmaps and tasks" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <RoadmapsManager />
      </main>
    </section>
  );
}

function CreatePanel() {
  return (
    <section className="w-full h-full flex flex-col">
      <PanelHeaderUnified title="Create" subtitle="Guided prompts coming in Sprint 2" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 max-w-3xl mx-auto w-full grid place-items-center">
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
      <PanelHeaderUnified title="Analyze" subtitle="Decision tools coming in Sprint 2" />
      <main className="flex-1 min-h-0 overflow-y-auto p-6 max-w-3xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
        { ["If–Then","Pros / Cons","One Constraint","One Metric"].map((tool)=> (
          <button key={tool} onClick={()=> toast({ title: tool, description: "Will save as analysis cards linked to goals." })} className="glass-panel rounded-xl p-4 elev smooth hover:scale-[1.02] text-left">
            <span className="font-semibold">{tool}</span>
            <p className="text-xs text-muted-foreground mt-1">Tap to start</p>
          </button>
        )) }
      </main>
    </section>
  );
}

function OverlayArrows({
  pos,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
}: {
  pos: [number, number];
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
}) {
  const canLeft = nextOccupied(pos[0], pos[1], "left") !== null;
  const canRight = nextOccupied(pos[0], pos[1], "right") !== null;
  const canUp = nextOccupied(pos[0], pos[1], "up") !== null;
  const canDown = nextOccupied(pos[0], pos[1], "down") !== null;

  const btnClass = "pointer-events-auto rounded-full glass-panel elev shadow-sm";
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {canUp && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Move up"
          className={`${btnClass} fixed top-20 left-1/2 -translate-x-1/2`}
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={moveUp}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      )}
      {canDown && (
        <Button
          size="icon"
          variant="secondary"
          aria-label="Move down"
          className={`${btnClass} fixed bottom-24 left-1/2 -translate-x-1/2`}
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={moveDown}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}
      {canLeft && (
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
      {canRight && (
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

function CompassIndicator({
  pos,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
}: {
  pos: [number, number];
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
}) {
  const canLeft = nextOccupied(pos[0], pos[1], "left") !== null;
  const canRight = nextOccupied(pos[0], pos[1], "right") !== null;
  const canUp = nextOccupied(pos[0], pos[1], "up") !== null;
  const canDown = nextOccupied(pos[0], pos[1], "down") !== null;

  const DotBtn = ({
    onClick,
    ariaLabel,
    active,
    available,
    style,
  }: {
    onClick?: () => void;
    ariaLabel?: string;
    active?: boolean;
    available?: boolean;
    style: React.CSSProperties;
  }) => {
    if (!active && !available) return null; // hide unavailable
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className="absolute pointer-events-auto flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
        style={{ width: 32, height: 32, ...style }}
      >
        <span
          className={`block rounded-full ${active ? 'bg-accent' : 'bg-muted-foreground'} ${available && !active ? 'opacity-60' : 'opacity-100'}`}
          style={{ width: 8, height: 8 }}
        />
      </button>
    );
  };

  // container 72x72 at bottom-right, above safe area
  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        width: 72,
        height: 72,
        right: `calc(env(safe-area-inset-right) + 12px)`,
        bottom: `calc(env(safe-area-inset-bottom) + var(--compass-bottom, 12px))` as unknown as number,
      }}
    >
      {/* center */}
      <DotBtn active style={{ left: 20, top: 20 }} ariaLabel="Current panel" />
      {/* satellites */}
      <DotBtn available={canUp} onClick={moveUp} ariaLabel="Go up" style={{ left: 20, top: 4 }} />
      <DotBtn available={canDown} onClick={moveDown} ariaLabel="Go down" style={{ left: 20, top: 36 }} />
      <DotBtn available={canLeft} onClick={moveLeft} ariaLabel="Go left" style={{ left: 4, top: 20 }} />
      <DotBtn available={canRight} onClick={moveRight} ariaLabel="Go right" style={{ left: 36, top: 20 }} />
    </div>
  );
}

const Index = () => {
  const { pos, onPointerDown, onPointerUp, current, moveLeft, moveRight, moveUp, moveDown, gotoPanel } = useSwipeNavigation();
  const [showKickoff, setShowKickoff] = useState(false);
  const { user, initializing } = useSupabaseAuth();

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

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem("kickoff.last");
    if (last !== today) setShowKickoff(true);
  }, []);

const handleKickoffComplete = () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("kickoff.last", today);
  } catch {}
  setShowKickoff(false);
  gotoPanel("live");
};

// Path interactions
const handleNodeClick = (node: PathNode) => {
  if (node.locked) {
    toast({ title: "Locked", description: "Complete prior lessons to unlock." });
    return;
  }
  switch (node.type) {
    case "core":
      gotoPanel("live");
      toast({ title: "Core lesson", description: "Starting focus session..." });
      break;
    case "read":
      gotoPanel("create");
      toast({ title: "Reading", description: "Opening reading tools..." });
      break;
    case "listen":
      gotoPanel("archive");
      toast({ title: "Listening", description: "Opening audio archive..." });
      break;
    case "boss":
      toast({ title: "Boss locked", description: "Beat all core lessons first." });
      break;
  }
};

const handleNavSelect = (key: 'home'|'map'|'live'|'rank'|'aurora') => {
  if (key === 'home') gotoPanel('live');
  if (key === 'map') gotoPanel('control');
  if (key === 'live') gotoPanel('create');
  if (key === 'rank') gotoPanel('analyze');
  if (key === 'aurora') gotoPanel('archive');
};

if (!initializing && !user) {
  return <LandingPage />;
}

  return (
    <div className="w-screen h-screen overflow-hidden relative" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <AppHeader />

      <div className="absolute inset-0 smooth" style={{ transform: translate }}>
        {/* 3x3 grid canvas sized by viewport */}
        <div className="relative" style={{ width: '300vw', height: '300vh' }}>
          {/* Place five panels */}
          <div className="absolute" style={{ left: '100vw', top: '100vh', width: '100vw', height: '100vh' }}>
            <LivePanel onManageRoadmaps={() => gotoPanel("control")} onNodeClick={handleNodeClick} onNavSelect={handleNavSelect} />
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

      {/* Compass indicator */}
      <CompassIndicator
        pos={pos}
        moveLeft={moveLeft}
        moveRight={moveRight}
        moveUp={moveUp}
        moveDown={moveDown}
      />

      {/* Floating edge arrows removed for immersive design */}

      <footer className="absolute bottom-4 left-4 text-xs text-muted-foreground z-10">
        <span>{current.toUpperCase()}</span>
      </footer>

      {/* Daily Kickoff overlay */}
      <DailyKickoff visible={showKickoff} onComplete={handleKickoffComplete} />

      {/* Global AI assistant */}
      <FloatingAssistant task={null} onUpdated={() => {}} />

      {/* Unified HUD */}
      <HUDBar />
    </div>
  );
};

export default Index;
