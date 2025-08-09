import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

export function StreakBadge() {
  const { user } = useSupabaseAuth();
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) { setStreak(0); return; }
      const { data, error } = await supabase
        .from("user_stats")
        .select("streak_count")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) setStreak((data as any).streak_count || 0);
    })();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
      <Flame className="w-4 h-4 text-destructive" />
      <span className="font-medium tabular-nums">{streak}</span>
    </div>
  );
}
