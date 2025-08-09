import CharacterPanel from './CharacterPanel'
import StatBars from './StatBars'
import QuickSlot from './QuickSlot'
import { quickSlots } from './hud.data'
import { useHUDActions } from './useHUDActions'
import { useEffect } from 'react'

export default function HUDBar() {
  const { run } = useHUDActions()

  // Desktop hotkeys 1..6
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.closest('input, textarea, [contenteditable="true"]'))) return
      const n = Number(e.key)
      if (n >= 1 && n <= 6) run(quickSlots[n-1].action as any)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [run])

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-2 z-40 flex justify-center pb-safe">
      <div className="hud-shell max-w-[1200px] w-[96%]">
        {/* Flex that wraps to 2 lines when tight */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          {/* Left: Character */}
          <div className="shrink-0"><CharacterPanel/></div>

          {/* Middle: Bars grow, wrap keeps them on line 1 */}
          <div className="grow min-w-[260px]"><StatBars/></div>

          {/* Right: System icons always at far right */}
          <div className="ml-auto flex items-center gap-2 order-3 sm:order-none">
            <button className="hud-icon settings" aria-label="Settings"/>
            <button className="hud-icon bag" aria-label="Bag"/>
            <button className="hud-icon map" aria-label="Map" onClick={()=>run('openMap' as any)}/>
            <button className="hud-icon chat" aria-label="Chat"/>
            <button className="hud-icon stick" aria-label="Joystick" onClick={() => document.dispatchEvent(new CustomEvent('mos:toggleJoystick'))}/>
          </div>

          {/* Quick Slots: full width on small (second line), inline on large */}
          <div className="flex items-center gap-3 basis-full sm:basis-auto order-4 sm:order-none">
            {quickSlots.map(s => (
              <QuickSlot key={s.id} hotkey={s.key} label={s.label} icon={s.icon} onClick={() => run(s.action as any)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

