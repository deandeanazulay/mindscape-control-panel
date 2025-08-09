import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type Task = { id: string; title: string; roadmap_id: string; status: string };

export default function QuestBoard() {
  const { user } = useSupabaseAuth();
  const [mainQuest, setMainQuest] = useState<Task | null>(null);
  const [sideQuests, setSideQuests] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setMainQuest(null); setSideQuests([]); return; }

      // active roadmap
      const { data: rms } = await supabase
        .from("roadmaps")
        .select("id, status")
        .eq("user_id", user.id);
      const active = (rms ?? []).find((r: any) => r.status === "active") as { id: string } | undefined;

      // current focus
      const { data: cf } = await supabase
        .from("current_focus")
        .select("task_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let main: Task | null = null;
      if (cf?.task_id) {
        const { data: t } = await supabase
          .from("tasks")
          .select("id, title, roadmap_id, status")
          .eq("user_id", user.id)
          .eq("id", cf.task_id)
          .maybeSingle();
        main = (t as any) ?? null;
      }

      // fallback choose first todo in active roadmap
      if (!main && active) {
        const { data: next } = await supabase
          .from("tasks")
          .select("id, title, roadmap_id, status")
          .eq("user_id", user.id)
          .eq("roadmap_id", active.id)
          .eq("status", "todo")
          .order("position", { ascending: true, nullsFirst: true })
          .order("created_at", { ascending: true })
          .limit(1);
        main = (next?.[0] as any) ?? null;
      }

      // side quests (up to 3 from active roadmap)
      let sides: Task[] = [];
      if (active) {
        const { data: list } = await supabase
          .from("tasks")
          .select("id, title, roadmap_id, status")
          .eq("user_id", user.id)
          .eq("roadmap_id", active.id)
          .eq("status", "todo")
          .order("position", { ascending: true, nullsFirst: true })
          .order("created_at", { ascending: true })
          .limit(4);
        sides = (list as any[] | null)?.filter((t) => t.id !== main?.id).slice(0, 3) ?? [];
      }

      if (!cancelled) {
        setMainQuest(main);
        setSideQuests(sides);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="grid gap-3">
      <Card className="p-4 bg-secondary">
        <div className="text-xs text-muted-foreground mb-1">Main Quest</div>
        <button
          className="text-left w-full font-semibold story-link"
          onClick={() => toast({ title: mainQuest?.title || "No focus set", description: "Opens task soon." })}
        >
          {mainQuest?.title ?? "Pick a focus from your roadmap"}
        </button>
      </Card>
      {sideQuests.length > 0 && (
        <Card className="p-4 bg-secondary">
          <div className="text-xs text-muted-foreground mb-2">Side Quests</div>
          <div className="grid gap-2">
            {sideQuests.map((q) => (
              <button
                key={q.id}
                className="text-left w-full text-sm opacity-90 hover:opacity-100 hover-scale"
                onClick={() => toast({ title: q.title, description: "Open details soon." })}
              >
                • {q.title}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
