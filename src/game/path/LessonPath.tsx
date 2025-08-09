import { nodes } from "./path.data";
import LessonNode from "./LessonNode";
import AvatarBlob from "./AvatarBlob";

export default function LessonPath() {
  return (
    <div className="mx-auto max-w-[560px] pt-20 pb-28 relative">
      {/* faint vignettes */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_0%,hsl(var(--accent)/.12),transparent)]" />
      <ul className="relative">
        {nodes.map((n, i) => (
          <li key={n.id} className="relative h-[140px]">
            {/* connector to next */}
            {i < nodes.length - 1 && (
              <span
                className={[
                  "absolute left-1/2 -translate-x-1/2 top-[60px] block",
                  "w-[18px] h-[110px] rounded-full",
                  "bg-[linear-gradient(to_bottom,hsl(var(--glass)),hsl(var(--accent)/.12))]",
                  "shadow-[0_0_0_2px_hsl(var(--accent)/.15)_inset,0_8px_18px_hsl(var(--accent)/.25)]",
                  // curve: alternate small rotations for a serpentine path
                  i % 2 ? "rotate-[-18deg] translate-x-[-120px]" : "rotate-[18deg] translate-x-[120px]",
                ].join(" ")}
              />
            )}
            {/* node */}
            <div className={i % 2 ? "pl-32" : "pr-32"}>
              <LessonNode {...n} />
            </div>
            {/* avatar stands on active node */}
            {n.active && (
              <div className={(i % 2 ? "pl-32" : "pr-32") + " absolute top-[10px] left-0 right-0 flex justify-center"}>
                <AvatarBlob />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
