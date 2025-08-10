import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { views } from "@/views/registry";
import { GameHUD } from "@/components/hud/GameHUD";
import { bus } from "@/utils/bus";
import { useViewNav } from "@/state/view";

export default function AppShell() {
  const loc = useLocation();
  const open = useViewNav();

  useEffect(() => {
    const off = bus.on('nav:view', ({ id, params }) => open(id as any, params));
    return off;
  }, [open]);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={loc} key={loc.pathname + loc.search}>
          {views.map((v) => (
            <Route
              key={v.id}
              path={v.path}
              element={
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="pb-[calc(var(--hud-h)+var(--hud-gap)+env(safe-area-inset-bottom))]"
                >
                  <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
                    <v.component />
                  </Suspense>
                </motion.div>
              }
            />
          ))}
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AnimatePresence>

      <GameHUD />
    </div>
  );
}
