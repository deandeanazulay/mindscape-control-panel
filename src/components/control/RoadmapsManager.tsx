import { useEffect, useMemo, useState } from "react";
import RoadmapForm from "./RoadmapForm";
import RoadmapsList, { RoadmapItem } from "./RoadmapsList";
import TasksManager from "./TasksManager";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProgressBar } from "@/components/live/ProgressBar";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";
import QuickAddTaskFAB from "@/components/tasks/QuickAddTaskFAB";
 
export default function RoadmapsManager() {
  const { user } = useSupabaseAuth();
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const isMobile = useIsMobile();

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
    const active = list.find(r=> r.status === 'active');
    if (active) setSelectedId(active.id); else setSelectedId(list[0]?.id ?? null);
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

    // Set the next TODO as current_focus
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

    setSelectedId(roadmapId);
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

  const { percent } = useRoadmapProgress(user?.id ?? null, selectedId);

  // Empty state
  if (items.length === 0) {
    const Creator = (
      isMobile ? (
        <Drawer open={newOpen} onOpenChange={setNewOpen}>
          <DrawerTrigger asChild>
            <Button>New Roadmap</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create roadmap</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <RoadmapForm onCreated={async (id) => { setNewOpen(false); await setActive(id); }} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button>New Roadmap</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create roadmap</DialogTitle>
            </DialogHeader>
            <RoadmapForm onCreated={async (id) => { setNewOpen(false); await setActive(id); }} />
          </DialogContent>
        </Dialog>
      )
    );

    return (
      <div className="glass-panel rounded-xl p-6 elev grid place-items-center min-h-[40vh]">
        <div className="text-center max-w-sm">
          <div className="text-sm text-muted-foreground mb-3">Create your first roadmap</div>
          {Creator}
        </div>
      </div>
    );
  }

  const CreatorControl = (
    isMobile ? (
      <Drawer open={newOpen} onOpenChange={setNewOpen}>
        <DrawerTrigger asChild>
          <Button size="sm">New</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create roadmap</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <RoadmapForm onCreated={async (id) => { setNewOpen(false); await setActive(id); }} />
          </div>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogTrigger asChild>
          <Button size="sm">New</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create roadmap</DialogTitle>
          </DialogHeader>
          <RoadmapForm onCreated={async (id) => { setNewOpen(false); await setActive(id); }} />
        </DialogContent>
      </Dialog>
    )
  );

  return (
    <div className="grid gap-5">
      {/* Header: Active roadmap selector */}
      <div className="glass-panel rounded-xl p-4 elev flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">Active roadmap</div>
        <div className="flex-1 min-w-0">
          <select
            aria-label="Select active roadmap"
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
            value={selectedId ?? ''}
            onChange={(e)=> setActive(e.target.value)}
          >
            {items.map((r)=> (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={()=> setShowAll((v)=> !v)}>Manage</Button>
          {CreatorControl}
        </div>
      </div>

      {/* Optional: all roadmaps */}
      {showAll && (
        <div className="rounded-xl border border-border p-3">
          <RoadmapsList
            items={items}
            selectedId={selectedId}
            onSelect={(id)=> setSelectedId(id)}
            onSetActive={setActive}
            onRename={rename}
            onDelete={remove}
          />
        </div>
      )}

      {/* Tasks for selected (active) roadmap */}
      {selectedId && (
        <div className="grid gap-3">
          <TasksManager roadmapId={selectedId} />
          <ProgressBar percent={percent} />
        </div>
      )}
      <QuickAddTaskFAB roadmapId={selectedId} />
    </div>
  );
}
