import LessonPath from "./LessonPath";



export default function GameHome({
  onNodeClick,
  onNavSelect,
}: {
  onNodeClick?: (node: import("./path.data").PathNode) => void;
  onNavSelect?: (key: 'home' | 'map' | 'live' | 'rank' | 'aurora') => void;
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--path-bg))] text-white relative overflow-hidden">
      
      <LessonPath onNodeClick={onNodeClick} />
      
    </div>
  );
}
