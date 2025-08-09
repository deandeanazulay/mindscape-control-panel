type Props = {
  hotkey?: string
  label: string
  icon?: string
  onClick: () => void
}

export default function QuickSlot({ hotkey, label, icon, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl hud-chip w-14 h-14 grid place-items-center border border-white/10 hover:scale-[1.03] active:scale-[0.98] transition-transform"
      aria-label={label}
    >
      <span className={`hud-glyph ${icon ?? ''}`} />
      <span className="absolute -bottom-3 text-[10px] opacity-80">{label}</span>
      {hotkey && <kbd className="absolute -top-2 -right-2 text-[10px] px-1 py-[2px] rounded bg-black/40">{hotkey}</kbd>}
    </button>
  )
}
