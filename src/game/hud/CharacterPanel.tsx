import { character } from './hud.data'
import { useGameStore } from '@/game/store'

export default function CharacterPanel() {
  const stats = useGameStore(s => s.stats)
  return (
    <div className="hud-chip rounded-2xl px-3 py-2 flex items-center gap-3 elev">
      <div className="relative">
        <div className="w-8 h-8 rounded-full shadow-inner" style={{ background: character.avatarColor }} />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full hud-dot" />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wide opacity-70 font-mono">Lv. {stats.level} • Streak {stats.streak} 🔥 • {character.job}</div>
        <div className="text-sm font-semibold">{character.name}</div>
      </div>
    </div>
  )
}
