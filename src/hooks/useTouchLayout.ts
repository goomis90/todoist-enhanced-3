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
