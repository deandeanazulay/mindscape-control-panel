import GameHome from "@/game/path/GameHome";
import type { PathNode } from "@/game/path/path.data";
import { useViewNav } from "@/state/view";

export default function ControlView() {
  const open = useViewNav();
  const onNodeClick = (node: PathNode) => {
    if (node.locked) return;
    const map: Record<PathNode['type'], any> = { core: 'focus', listen: 'hypno', read: 'notes', boss: 'analyze' };
    open(map[node.type]);
  };
  return (
    <div className="min-h-screen">
      <GameHome onNodeClick={onNodeClick} />
    </div>
  );
}

