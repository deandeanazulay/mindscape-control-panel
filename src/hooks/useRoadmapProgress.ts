import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfTodayISO } from "@/lib/utils";

/**
 * Compute daily progress for a roadmap as:
 * percent = (doneToday / totalTasksInRoadmap) * 100
 * - doneToday: tasks with status='done' and completed_at >= start of today
 * - total: all tasks in the roadmap (min 1 to avoid divide-by-zero)
 */
export function useRoadmapProgress(userId: string | null, roadmapId: string | null) {
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const dateStart = useMemo(() => startOfTodayISO(), []);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const compute = useCallback((tasks: any[]) => {
    const total = tasks.length || 1;
    const doneToday = tasks.filter(
      (t) => t.status === "done" && t.completed_at && t.completed_at >= dateStart
    ).length;
    return Math.round((doneToday / total) * 100);
  }, [dateStart]);

  const refresh = useCallback(async () => {
    if (!userId || !roadmapId) {
      setPercent(0);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("id, status, completed_at")
      .eq("user_id", userId)
      .eq("roadmap_id", roadmapId);
    if (!error) {
      setPercent(compute(data ?? []));
    } else {
      console.error(error);
    }
    setLoading(false);
  }, [userId, roadmapId, compute]);

  useEffect(() => {
    // initial fetch on deps change
    refresh();
  }, [refresh]);

  useEffect(() => {
    // realtime subscription for task changes
    if (!userId || !roadmapId) {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      return;
    }

    const channel = supabase
      .channel("roadmap-progress")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, (payload) => {
        const row: any = payload.new;
        if (row?.user_id === userId && row?.roadmap_id === roadmapId) {
          refresh();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, (payload) => {
        const row: any = payload.new;
        const oldRow: any = payload.old;
        // refresh if the task belongs/belonged to this roadmap/user and status/completed_at changed
        const touchesUserRoadmap =
          (row?.user_id === userId && row?.roadmap_id === roadmapId) ||
          (oldRow?.user_id === userId && oldRow?.roadmap_id === roadmapId);
        if (touchesUserRoadmap) {
          refresh();
        }
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" }, (payload) => {
        const oldRow: any = payload.old;
        if (oldRow?.user_id === userId && oldRow?.roadmap_id === roadmapId) {
          refresh();
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, roadmapId, refresh]);

  return { percent, loading, refresh } as const;
}
