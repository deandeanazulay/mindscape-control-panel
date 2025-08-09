import type { QuickActionKey } from './hud.data'

export function useHUDActions() {
  const run = (a: QuickActionKey) => {
    const eventMap: Record<QuickActionKey, string> = {
      startFocus: 'mos:startFocus',
      startHypnosis: 'mos:startHypnosis',
      voiceNote: 'mos:voiceNote',
      addNote: 'mos:addNote',
      openAnalyze: 'mos:openAnalyze',
      openMap: 'mos:openMap',
    };
    const name = eventMap[a];
    document.dispatchEvent(new CustomEvent(name));
  }
  return { run }
}
