import { useEffect, useState } from 'react';

/**
 * Whether this is a phone, and whether the pointer is a finger.
 *
 * Two separate questions that a single "is mobile" answer keeps confusing. A
 * narrow window on a laptop has a mouse in it and should keep every hover
 * affordance; a tablet is wide and has none. What changes with the width is
 * the layout, and what changes with the pointer is the gesture — so they are
 * asked, and answered, apart.
 */

/** Where the layout stops being a desktop one. Matches the CSS breakpoint. */
const PHONE = '(max-width: 720px)';
/** No hover and no fine pointer: a finger. */
const TOUCH = '(hover: none) and (pointer: coarse)';

function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const read = () => setMatches(list.matches);
    read();
    list.addEventListener('change', read);
    return () => list.removeEventListener('change', read);
  }, [query]);

  return matches;
}

export const useIsPhone = (): boolean => useMedia(PHONE);
export const useIsTouch = (): boolean => useMedia(TOUCH);

/**
 * Whether to behave like a phone: the layout is a phone's, or the pointer is a
 * finger, or both.
 *
 * The gestures were gated on the pointer alone, which made them impossible to
 * try in a narrow window on a laptop — the one place the layout is actually
 * worked on. They are driven by pointer events, which a mouse raises too, so
 * the narrow window can have them: holding the button is holding, and dragging
 * sideways is a swipe. A phone still gets them for the other reason.
 */
export function usePhoneBehaviour(): boolean {
  /* Both asked, every time, and combined afterwards. `a() || b()` would stop
     at the first true and skip the second hook, which is a different number of
     hooks on different renders — the one thing React cannot survive. */
  const phone = useMedia(PHONE);
  const touch = useMedia(TOUCH);
  return phone || touch;
}
