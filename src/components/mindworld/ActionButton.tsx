export default function ActionButton({ label = "Action", onPress }: { label?: string; onPress: () => void }) {
  return (
    <div className="fixed right-4 controls-safe" style={{ bottom: `calc(env(safe-area-inset-bottom) + 16px)` }}>
      <button
        aria-label={label}
        onClick={onPress}
        className="h-16 w-16 rounded-2xl glass-panel elev grid place-items-center text-sm font-medium border border-border hover-scale"
      >
        {label}
      </button>
    </div>
  );
}
