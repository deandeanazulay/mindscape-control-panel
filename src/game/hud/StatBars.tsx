import { useGameStore } from '@/game/store'

const Bar = ({label,hue,value}:{label:string; hue:string; value:number}) => (
  <div className="w-full">
    <div className="text-[10px] uppercase tracking-wide opacity-70">{label}</div>
    <div className="h-3 rounded-full bg-white/6 overflow-hidden hud-bar">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, hsl(${hue} / .9), hsl(${hue}))` }} />
    </div>
  </div>
)

export default function StatBars() {
  const stats = useGameStore(s => s.stats)
  return (
    <div className="space-y-2 min-w-[260px] w-[min(480px,50vw)]">
      <Bar label="HP" hue="0 80% 60%" value={stats.hp}/>
      <Bar label="MP" hue="210 90% 65%" value={stats.mp}/>
      <Bar label="XP" hue="200 90% 55%" value={stats.xp}/>
    </div>
  )
}
