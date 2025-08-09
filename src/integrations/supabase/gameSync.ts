
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight helpers to sync game actions with Supabase.
 * All helpers no-op if the user is not authenticated.
 */

export async function getUid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function awardXPRemote(activity: string, amount: number, metadata: Record<string, any> = {}) {
  const uid = await getUid();
  if (!uid) {
    console.log("[gameSync] awardXPRemote skipped (no user)", { activity, amount });
    return null;
  }
  const { data, error } = await supabase.rpc("award_xp", { activity, amount, metadata });
  if (error) {
    console.error("[gameSync] award_xp error", error);
    return null;
  }
  console.log("[gameSync] award_xp ok", data);
  // Notify UI so components like XPBar can reflect server totals instantly
  try {
    const total = (Array.isArray(data) ? data[0]?.total_xp : (data as any)?.total_xp) ?? null;
    if (typeof total === "number") {
      window.dispatchEvent(new CustomEvent("xp-total-update", { detail: { total_xp: total } }));
    }
  } catch (e) {
    console.warn("[gameSync] xp-total-update event failed", e);
  }
  return data;
}

export async function upsertQuest(questId: string, completed = true) {
  const uid = await getUid();
  if (!uid) {
    console.log("[gameSync] upsertQuest skipped (no user)", { questId });
    return null;
  }
  const payload = {
    user_id: uid,
    quest_id: questId,
    completed_bool: completed,
    // xp_awarded_int left at 0 here; XP is handled via award_xp()
  };
  const { data, error } = await supabase
    .from("quests")
    .upsert(payload, { onConflict: "user_id, date, quest_id" })
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[gameSync] upsertQuest error", error);
    return null;
  }
  console.log("[gameSync] upsertQuest ok", data);
  return data;
}

export async function logEvent(type: string, payload: Record<string, any> = {}) {
  const uid = await getUid();
  if (!uid) {
    // For unauthenticated users we just skip server logging.
    return;
  }
  const { error } = await supabase.from("events").insert({ user_id: uid, type, payload });
  if (error) {
    console.error("[gameSync] logEvent error", error);
  } else {
    console.log("[gameSync] event logged", type, payload);
  }
}
