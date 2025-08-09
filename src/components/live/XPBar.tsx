import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export function XPBar() {
  const { user } = useSupabaseAuth();
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) { setTotal(0); return; }
      const { data, error } = await supabase
        .from("user_stats")
        .select("total_xp")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) setTotal((data as any).total_xp || 0);
    })();
    return () => { mounted = false; };
  }, [user]);

  const level = useMemo(() => Math.floor(total / 100) + 1, [total]);
  const intoLevel = useMemo(() => total % 100, [total]);

  if (!user) return null;

  return (
    <div className="glass-panel rounded-xl p-4 elev">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">XP Progress</div>
        <div className="text-xs text-muted-foreground">Level {level}</div>
      </div>
      <div className="mt-2">
        <Progress value={intoLevel} />
      </div>
    </div>
  );
}
