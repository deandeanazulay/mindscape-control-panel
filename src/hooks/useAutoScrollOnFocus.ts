import { useEffect } from "react";

// Ensures focused inputs scroll into view (useful on mobile keyboards)
export function useAutoScrollOnFocus(container?: HTMLElement | null) {
  useEffect(() => {
    const root = container ?? document.body;
    const selector = 'input, textarea, [contenteditable="true"], select';
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));

    const onFocus = (el: HTMLElement) => {
      // Defer to allow keyboard to open on mobile
      setTimeout(() => {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {}
      }, 150);
    };

    const handlers: Array<() => void> = [];
    for (const el of elements) {
      const fn = () => onFocus(el);
      el.addEventListener('focus', fn, { passive: true });
      handlers.push(() => el.removeEventListener('focus', fn as EventListener));
    }

    return () => { handlers.forEach((off) => off()); };
  }, [container]);
}
