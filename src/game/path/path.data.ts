export type NodeType = "core" | "listen" | "read" | "boss";
export type PathNode = { id: string; type: NodeType; active?: boolean; locked?: boolean };

export const nodes: PathNode[] = [
  { id: "n1", type: "core", active: true },
  { id: "n2", type: "read" },
  { id: "n3", type: "listen" },
  { id: "n4", type: "core" },
  { id: "n5", type: "boss", locked: true },
];
