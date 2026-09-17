import { useEffect, useRef } from 'react';

/**
 * Arrow keys inside a menu that has just opened.
 *
 * A menu reached from the keyboard that then has to be clicked is a menu that
 * has been opened by mistake. These are plain lists of buttons — a `role=menu`
 * with nothing driving it — so this gives them the one behaviour the role
 * promises: the first item takes focus when the menu appears, Up and Down walk
 * the list and wrap at both ends, Home and End go to the ends, and Enter is
 * simply the button being pressed, which it already was.
 *
 * Escape closes the menu and goes no further. A menu opened inside a dialog is
 * in front of that dialog, and Escape means the thing in front — without this,
 * putting the menu away took the task panel behind it along too.
 */
export function useMenuKeys(open: boolean, onClose?: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closing = useRef(onClose);
  closing.current = onClose;

  useEffect(() => {
    if (!open) return;
    const menu = ref.current;
    if (!menu) return;

    const items = (): HTMLElement[] =>
      [...menu.querySelectorAll<HTMLElement>('button:not([disabled])')]
        .filter((item) => item.offsetParent !== null);

    /* The first item, after the browser has drawn the menu: focusing it in the
       same tick as the click that opened it loses the focus to the button
       being released. */
    const opening = window.setTimeout(() => items()[0]?.focus(), 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closing.current?.();
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
      const list = items();
      if (list.length === 0) return;

      if (step !== 0) {
        event.preventDefault();
        event.stopPropagation();
        const at = list.indexOf(document.activeElement as HTMLElement);
        // Wrapping at both ends: a menu is a ring, not a column with a floor.
        const next = at < 0
          ? (step > 0 ? 0 : list.length - 1)
          : (at + step + list.length) % list.length;
        list[next].focus();
        return;
      }
      if (event.key === 'Home') { event.preventDefault(); list[0].focus(); }
      if (event.key === 'End') { event.preventDefault(); list[list.length - 1].focus(); }
    };

    menu.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(opening);
      menu.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return ref;
}
