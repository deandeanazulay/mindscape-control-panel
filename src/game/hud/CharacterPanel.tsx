import { character } from './hud.data'

export default function CharacterPanel() {
  return (
    <div className="hud-chip rounded-xl border border-white/10 px-3 py-2 flex items-center gap-3">
      <div className="relative">
        <div className="w-8 h-8 rounded-full shadow-inner" style={{ background: character.avatarColor }} />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full hud-dot" />
      </div>
      <div className="leading-tight">
        <div className="text-[11px] opacity-70">Lv. {character.level} • {character.job}</div>
        <div className="text-sm font-semibold">{character.name}</div>
      </div>
    </div>
  )
}
