import { useEffect, useState } from "react";
import RoadmapForm from "./RoadmapForm";
import RoadmapsList, { RoadmapItem } from "./RoadmapsList";
import TasksManager from "./TasksManager";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function RoadmapsManager() {
  const { user } = useSupabaseAuth();
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchRoadmaps = async () => {
    if (!user) { setItems([]); return; }
    const { data, error } = await supabase
      .from("roadmaps")
      .select("id, title, color, status, position")
      .eq("user_id", user.id)
      .order("position", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: true });
    if (error) { console.error(error); return; }
    const list = (data ?? []) as any[] as RoadmapItem[];
    setItems(list);
    if (!selectedId) {
      const active = list.find(r=> r.status === 'active');
      setSelectedId(active?.id ?? list[0]?.id ?? null);
    }
  };

  useEffect(()=> { fetchRoadmaps(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const setActive = async (roadmapId: string) => {
    if (!user) { toast({ title: "Sign in required", description: "Connect Supabase to manage roadmaps." }); return; }
    const current = items.find(r=> r.status==='active');
    if (current && current.id !== roadmapId) {
      const { error: pauseErr } = await supabase.from("roadmaps").update({ status: 'paused' }).eq("id", current.id).eq("user_id", user.id);
      if (pauseErr) console.error(pauseErr);
    }
    const { error: actErr } = await supabase.from("roadmaps").update({ status: 'active' }).eq("id", roadmapId).eq("user_id", user.id);
    if (actErr) { console.error(actErr); toast({ title: "Error", description: "Could not activate roadmap." }); return; }
    toast({ title: "Activated", description: "Roadmap set as live." });

    // Fetch next task and update current_focus
    const { data: next, error: nextErr } = await supabase
      .from("tasks").select("id").eq("user_id", user.id).eq("roadmap_id", roadmapId)
      .eq("status", "todo")
      .order("position", { ascending: true, nullsFirst: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(1);
    if (nextErr) console.error(nextErr);
    const nextTask = next?.[0] as any | undefined;
    await supabase.from("current_focus").upsert({ user_id: user.id, task_id: nextTask ? nextTask.id : null, started_at: new Date().toISOString() });

    await fetchRoadmaps();
  };

  const rename = async (id: string) => {
    const r = items.find(i=> i.id===id); if (!r) return;
    const next = window.prompt("Rename roadmap", r.title);
    if (!next || !next.trim() || next.trim() === r.title) return;
    const { error } = await supabase.from("roadmaps").update({ title: next.trim() }).eq("id", id);
    if (error) console.error(error); else toast({ title: "Updated", description: "Roadmap renamed." });
    await fetchRoadmaps();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this roadmap? This does not delete tasks automatically.")) return;
    const { error } = await supabase.from("roadmaps").delete().eq("id", id);
    if (error) console.error(error); else toast({ title: "Deleted", description: "Roadmap removed." });
    if (selectedId === id) setSelectedId(null);
    await fetchRoadmaps();
  };

  return (
    <div className="glass-panel rounded-xl p-5 elev grid gap-6">
      <RoadmapForm onCreated={fetchRoadmaps} />
      <div className="pt-2 border-t border-border">
        <RoadmapsList
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSetActive={setActive}
          onRename={rename}
          onDelete={remove}
        />
      </div>
      {selectedId && (
        <div className="pt-2 border-t border-border">
          <TasksManager roadmapId={selectedId} />
        </div>
      )}
    </div>
  );
}
