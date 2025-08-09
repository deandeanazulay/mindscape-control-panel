import { useEffect, useMemo, useRef, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export function XPBar() {
  const { user } = useSupabaseAuth();
  const [total, setTotal] = useState<number>(0);
  const [spark, setSpark] = useState(false);
  const prevLevel = useRef(1);

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

  useEffect(() => {
    if (level > prevLevel.current) {
      setSpark(true);
      const t = setTimeout(() => setSpark(false), 900);
      return () => clearTimeout(t);
    }
    prevLevel.current = level;
  }, [level]);

  // Sparkle on local XP awards (store-driven)
  useEffect(() => {
    const h = () => {
      setSpark(true);
      const t = setTimeout(() => setSpark(false), 900);
      return () => clearTimeout(t);
    };
    window.addEventListener('xp-sparkle', h as any);
    return () => window.removeEventListener('xp-sparkle', h as any);
  }, []);

  if (!user) return null;

  return (
    <div className={`glass-panel rounded-xl p-4 elev relative ${spark ? 'sparkle' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">XP Progress</div>
        <div className="text-xs text-muted-foreground">Level {level}</div>
      </div>
      <div className="mt-2 relative">
        <Progress value={intoLevel} />
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="text-xs font-medium text-secondary-foreground">{intoLevel}%</span>
        </div>
      </div>
    </div>
  );
}
