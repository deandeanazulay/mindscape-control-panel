export default function AvatarIdle({ size = 80 }: { size?: number }) {
  const s = size;
  return (
    <div className="idle-float" aria-label="Your avatar" role="img">
      <div
        className="rounded-2xl glass-panel elev grid place-items-center"
        style={{ width: s, height: s, borderRadius: s * 0.28 }}
      >
        {/* simple face */}
        <div className="relative" style={{ width: s * 0.6, height: s * 0.4 }}>
          <span className="absolute left-[10%] top-[30%] w-2 h-2 rounded-full bg-foreground/80" />
          <span className="absolute right-[10%] top-[30%] w-2 h-2 rounded-full bg-foreground/80" />
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[20%] w-6 h-[3px] rounded-full bg-foreground/70" />
        </div>
      </div>
    </div>
  );
}
