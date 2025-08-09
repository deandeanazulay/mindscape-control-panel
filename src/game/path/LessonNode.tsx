type Props = {
  id: string;
  type: "core" | "listen" | "read" | "boss";
  locked?: boolean;
  active?: boolean;
  onClick?: () => void;
};

export default function LessonNode({ type, locked, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={[
        "relative w-[104px] h-[104px] rounded-full select-none",
        "grid place-items-center",
        "node-gloss",
        active ? "node-pulse" : "",
        locked ? "opacity-50" : "hover:scale-[1.02] active:scale-[0.98] transition-transform",
      ].join(" ")}
      aria-label={locked ? "Locked lesson" : `Lesson: ${type}`}
      aria-pressed={active ? true : undefined}
      aria-disabled={locked ? true : undefined}
    >
      {/* ring */}
      <span className="absolute inset-[-8px] rounded-full ring-2 ring-[hsl(var(--node-ring))]/70 ring-offset-0 node-ring-shadow" />
      {/* icon shape (CSS only) */}
      <span
        aria-hidden
        className={[
          "block w-9 h-9",
          type === "core" && "css-star",
          type === "listen" && "css-headphones",
          type === "read" && "css-book",
          type === "boss" && "css-crown",
        ].join(" ")}
      />
      {/* three tiny stars under active */}
      {active && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-1">
          <i className="tiny-star" /><i className="tiny-star opacity-70" /><i className="tiny-star opacity-40" />
        </span>
      )}
    </button>
  );
}
