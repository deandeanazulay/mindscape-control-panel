
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CurrentFocusCard } from "./CurrentFocusCard";
import { QuickActionsBar } from "./QuickActionsBar";
import { ProgressBar } from "./ProgressBar";
import { MoodCheck } from "./MoodCheck";
import { FloatingAssistant } from "@/components/live/FloatingAssistant";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";

type Roadmap = {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  status: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  roadmap_id: string;
  status: string;
  position: number | null;
};

export default function LiveFocusView({ onManageRoadmaps }: { onManageRoadmaps?: () => void }) {
  const { user, initializing } = useSupabaseAuth();
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { percent, refresh: refreshProgress } = useRoadmapProgress(user?.id ?? null, activeRoadmap?.id ?? null);

  // Load roadmaps, active roadmap, and focused task
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (initializing) return;
      setLoading(true);

      if (!user) {
        setActiveRoadmap(null);
        setTask(null);
        setRoadmaps([]);
        setLoading(false);
        return;
      }

      // All roadmaps
      const { data: rms, error: rmsErr } = await supabase
        .from("roadmaps")
        .select("id, title, description, color, status")
        .eq("user_id", user.id)
        .order("position", { ascending: true, nullsFirst: true });
      if (rmsErr) {
        console.error(rmsErr);
      }
      const list = (rms ?? []) as Roadmap[];
      setRoadmaps(list);

      // Active roadmap
      const active = list.find((r) => r.status === "active") ?? null;
      setActiveRoadmap(active);

      // Current focus
      const { data: cf, error: cfErr } = await supabase
        .from("current_focus")
        .select("task_id, started_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cfErr) console.error(cfErr);

      let currentTask: Task | null = null;
      if (cf?.task_id) {
        const { data: t, error: tErr } = await supabase
          .from("tasks")
          .select("id, title, description, due_at, roadmap_id, status, position")
          .eq("user_id", user.id)
          .eq("id", cf.task_id)
          .maybeSingle();
        if (!tErr && t) currentTask = t as Task;
      }

      // If no focus task, or it doesn't match an active roadmap, pick next one
      if ((!currentTask || (active && currentTask.roadmap_id !== active.id)) && active) {
        const { data: next, error: nextErr } = await supabase
          .from("tasks")
          .select("id, title, description, due_at, roadmap_id, status, position")
          .eq("user_id", user.id)
          .eq("roadmap_id", active.id)
          .in("status", ["doing", "todo"])
          .order("position", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true })
          .limit(1);
        if (nextErr) {
          console.error(nextErr);
        }
        currentTask = (next?.[0] as Task) ?? null;

        // Persist focus
        const { error: upErr } = await supabase.from("current_focus").upsert({
          user_id: user.id,
          task_id: currentTask ? currentTask.id : null,
          started_at: new Date().toISOString(),
        });
        if (upErr) console.error(upErr);
      }

      if (!cancelled) {
        setTask(currentTask);
        setLoading(false);
      }

      // Progress handled by useRoadmapProgress hook
    })();

    return () => {
      cancelled = true;
    };
  }, [user, initializing]);

  const switchActive = async (roadmapId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Connect Supabase to manage roadmaps." });
      return;
    }
    // Pause existing active first to respect unique index
    const currentActive = roadmaps.find((r) => r.status === "active");
    if (currentActive && currentActive.id !== roadmapId) {
      const { error: pauseErr } = await supabase
        .from("roadmaps")
        .update({ status: "paused" })
        .eq("id", currentActive.id)
        .eq("user_id", user.id);
      if (pauseErr) console.error(pauseErr);
    }
    // Activate the selected roadmap
    const { error: actErr } = await supabase
      .from("roadmaps")
      .update({ status: "active" })
      .eq("id", roadmapId)
      .eq("user_id", user.id);
    if (actErr) {
      console.error(actErr);
      toast({ title: "Error", description: "Could not activate roadmap." });
      return;
    }
    toast({ title: "Activated", description: "Roadmap set as live." });
    // Reload minimal state
    const newActive = roadmaps.find((r) => r.id === roadmapId) ?? null;
    if (newActive) newActive.status = "active";
    setActiveRoadmap(newActive);
    // Force pick next task for new roadmap
    if (newActive) {
      const { data: next, error: nextErr } = await supabase
        .from("tasks")
        .select("id, title, description, due_at, roadmap_id, status, position")
        .eq("user_id", user.id)
        .eq("roadmap_id", newActive.id)
        .in("status", ["doing", "todo"])
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
        .limit(1);
      if (!nextErr) {
        const nextTask = (next?.[0] as Task) ?? null;
        setTask(nextTask);
        await supabase.from("current_focus").upsert({
          user_id: user.id,
          task_id: nextTask ? nextTask.id : null,
          started_at: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <section className="w-full h-full flex flex-col">
      <header className="px-6 pt-8">
        <div className="glass-panel rounded-xl p-5 elev flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Live</h2>
            <p className="text-sm text-muted-foreground mt-1">Focus on one thing, right now.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Roadmap switcher */}
            <select
              className="text-sm bg-background border border-border rounded px-3 py-2"
              value={activeRoadmap?.id ?? ""}
              onChange={(e) => switchActive(e.target.value)}
            >
              <option value="" disabled>Select roadmap…</option>
              {roadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} {r.status === "active" ? "•" : ""}
                </option>
              ))}
            </select>
            {/* Create roadmap quick action (simple stub) */}
            <Button
              variant="secondary"
              onClick={() => {
                if (onManageRoadmaps) onManageRoadmaps();
                else toast({ title: "Roadmaps", description: "Manage your roadmaps and tasks in the Control panel for now." });
              }}
            >
              Manage
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-6">
        {!user && !initializing && (
          <div className="glass-panel rounded-xl p-6 text-center">
            <div className="text-sm text-muted-foreground">
              Sign in to enable Live Focus, background sound, and quick capture.
            </div>
          </div>
        )}

        <CurrentFocusCard
          activeRoadmap={activeRoadmap}
          task={task}
          onAdvance={(next) => { setTask(next); refreshProgress(); }}
        />

        <QuickActionsBar currentTask={task} />

        <ProgressBar percent={percent} />

        <MoodCheck />
      </main>
      {/* Floating assistant is global on this screen */}
      <FloatingAssistant
        task={task}
        onUpdated={(desc) => setTask((prev) => (prev ? { ...prev, description: desc } : prev))}
      />
    </section>
  );
}
