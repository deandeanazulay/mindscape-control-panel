
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useState } from "react";

type Roadmap = {
  id: string;
  title: string;
  color: string | null;
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

export function CurrentFocusCard({
  activeRoadmap,
  task,
  onAdvance,
}: {
  activeRoadmap: Roadmap | null;
  task: Task | null;
  onAdvance: (next: Task | null) => void;
}) {
  const { user } = useSupabaseAuth();
  const [busy, setBusy] = useState(false);

  const markDoneAndAdvance = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Connect Supabase to track your progress." });
      return;
    }
    if (!task) return;

    setBusy(true);
    const now = new Date().toISOString();

    // 1) mark current task done
    const { error: updErr } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: now })
      .eq("id", task.id)
      .eq("user_id", user.id);
    if (updErr) {
      console.error(updErr);
      setBusy(false);
      return;
    }

    // 2) pick next task in this roadmap (todo/doing by position asc)
    const { data: nextTasks, error: nextErr } = await supabase
      .from("tasks")
      .select("id, title, description, due_at, roadmap_id, status, position")
      .eq("user_id", user.id)
      .eq("roadmap_id", task.roadmap_id)
      .in("status", ["todo", "doing"])
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(1);
    if (nextErr) {
      console.error(nextErr);
      setBusy(false);
      return;
    }

    const next = (nextTasks?.[0] as Task) ?? null;

    // 3) upsert current_focus
    const { error: cfErr } = await supabase.from("current_focus").upsert({
      user_id: user.id,
      task_id: next ? next.id : null,
      started_at: now,
    });
    if (cfErr) console.error(cfErr);

    toast({
      title: next ? "Great job!" : "Well done",
      description: next ? `Next up: ${next.title}` : "No more tasks in this roadmap.",
    });

    onAdvance(next);
    setBusy(false);
  };

  return (
    <div className="glass-panel rounded-xl p-5 elev">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">
            {activeRoadmap ? "Current Focus" : "No active roadmap"}
          </div>
          <h2 className="text-xl font-semibold mt-1">
            {task ? task.title : activeRoadmap ? "No task selected" : "Choose an active roadmap"}
          </h2>
          {activeRoadmap && (
            <div className="mt-1 text-xs inline-flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: activeRoadmap.color ?? "hsl(var(--primary))" }}
              />
              <span className="text-muted-foreground">{activeRoadmap.title}</span>
            </div>
          )}
          {task?.due_at && (
            <div className="mt-1 text-xs text-muted-foreground">Due: {new Date(task.due_at).toLocaleString()}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={!task || busy} onClick={markDoneAndAdvance}>
            {busy ? "Updating..." : task ? "Done" : "No Task"}
          </Button>
        </div>
      </div>
      {task?.description && (
        <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{task.description}</p>
      )}
    </div>
  );
}
