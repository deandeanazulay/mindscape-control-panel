import { lazy } from "react";

export type ViewId =
  | "control" | "focus" | "hypno" | "voice" | "notes"
  | "analyze" | "browser" | "portal" | "archive" | "settings" | "agent" | "runner";

export type ViewMeta = {
  id: ViewId;
  label: string;
  path: string;
  icon?: JSX.Element;
  component: React.LazyExoticComponent<() => JSX.Element>;
  hotkey?: string;
};

export const views: ViewMeta[] = [
  { id: "control", label: "Control", path: "/app",          component: lazy(() => import("./ControlView")) },
  { id: "focus",   label: "Focus",   path: "/app/focus",    component: lazy(() => import("./FocusView")) },
  { id: "hypno",   label: "Hypno",   path: "/app/hypno",    component: lazy(() => import("./HypnoView")) },
  { id: "voice",   label: "Voice",   path: "/app/voice",    component: lazy(() => import("./VoiceView")) },
  { id: "notes",   label: "Notes",   path: "/app/notes",    component: lazy(() => import("./NotesView")) },
  { id: "analyze", label: "Analyze", path: "/app/analyze",  component: lazy(() => import("./AnalyzeView")) },
  { id: "browser", label: "Browser", path: "/app/browser",  component: lazy(() => import("./BrowserView")) },
  { id: "portal",  label: "Portal",  path: "/app/portal",   component: lazy(() => import("./PortalView")) },
  { id: "archive", label: "Archive", path: "/app/archive",  component: lazy(() => import("./ArchiveView")) },
  { id: "settings",label: "Settings",path: "/app/settings", component: lazy(() => import("./SettingsView")) },
  { id: "agent",   label: "Agent",   path: "/app/agent",    component: lazy(() => import("./AgentFullView")) },
  { id: "runner",  label: "Node",    path: "/app/node/:id", component: lazy(() => import("../pages/NodeRunner")) },
];
