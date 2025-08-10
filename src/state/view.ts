import { create } from "zustand";
import type { ViewId } from "@/views/registry";
import { useNavigate } from "react-router-dom";
import { views } from "@/views/registry";

type NavState = {
  current: ViewId;
  set: (v: ViewId) => void;
};

export const useView = create<NavState>((set) => ({
  current: "control",
  set: (v) => set({ current: v }),
}));

export function useViewNav() {
  const nav = useNavigate();
  return (id: ViewId, params?: Record<string, string>) => {
    const meta = views.find((v) => v.id === id)!;
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    nav(`${meta.path}${qs}`);
  };
}
