import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import {
  PRESS_HOLD_MS, PRESS_SLOP_PX, ROW_PRESS_EVENT,
  SWIPE_COMMIT_RATIO, SWIPE_TRAY_PX,
} from '@/domain/gestures';

/**
 * Swipe a row aside for its buttons; hold it down for their names.
 *
 * ## Why the row has to decide what a press is
 *
 * A press on a task row could be three things and there is no way to know
 * which until it moves, or does not:
 *
 * - moved sideways, it is a swipe, and the row follows the finger;
 * - moved up or down, it is the page scrolling, and the row must let go of it
 *   entirely — a list that fights the scroll is a list nobody can read;
 * - not moved at all, for long enough, it is a hold, and the row's menu opens.
 *
 * So the gesture starts undecided. It watches the first movement, and the
 * direction of that movement settles it: further sideways than up, it is a
 * swipe; otherwise the press is abandoned and the browser gets its scroll
 * back, untouched. Deciding on direction rather than on a timer is what makes
 * a fast flick down the list scroll instead of dragging a row halfway open.
 *
 * ## One row open at a time
 *
 * A list with three rows hanging open is a list that has lost its shape, and
 * the one open row is closed by anything else that happens — another row being
 * swiped, a tap anywhere, a scroll. Every open row listens for one another's
 * announcement rather than any of them being kept in a store: this is a
 * property of the surface, not of the data, and it lives and dies with the
 * rows on screen.
 */

/** Sent when any row opens, so the others put themselves away. */
const ROW_OPENED = 'enhanced:rowopened';

/**
 * Keeping the pointer on the row it started on, where the browser will let us.
 *
 * Capture is a nicety — it stops a fast swipe losing the row when the finger
 * outruns it — and it is refused for a pointer the browser is not tracking,
 * which throws. A gesture must not fail because the polish was unavailable.
 */
const capture = (node: HTMLElement, pointerId: number, hold: boolean) => {
  try {
    if (hold) node.setPointerCapture(pointerId);
    else if (node.hasPointerCapture(pointerId)) node.releasePointerCapture(pointerId);
  } catch {
    /* Not a pointer this browser is tracking. The gesture works without it. */
  }
};

/** Which way the press turned out to be going. */
type Decision = 'undecided' | 'swiping' | 'given-up';

export interface RowGesture {
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
  style: CSSProperties;
  className: string;
  /** Whether a press has just been answered by a gesture rather than a tap. */
  justGestured: () => boolean;
}

const NOTHING: RowGesture['handlers'] = {
  onPointerDown: () => {},
  onPointerMove: () => {},
  onPointerUp: () => {},
  onPointerCancel: () => {},
};

export function useRowGesture(enabled: boolean): RowGesture {
  /** How far the row is pulled aside, in pixels, never positive. */
  const [offset, setOffset] = useState(0);
  /** True while a finger is on it, so the row tracks rather than animates. */
  const [tracking, setTracking] = useState(false);

  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const decision = useRef<Decision>('undecided');
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answeredAt = useRef(0);
  const rowRef = useRef<HTMLElement | null>(null);

  const clearHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  const close = useCallback(() => {
    setOffset(0);
    setTracking(false);
  }, []);

  /* Any other row opening, and any scroll, puts this one away. */
  useEffect(() => {
    if (!enabled) return;
    const elsewhere = (event: Event) => {
      if ((event as CustomEvent<HTMLElement | null>).detail === rowRef.current) return;
      close();
    };
    document.addEventListener(ROW_OPENED, elsewhere);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener(ROW_OPENED, elsewhere);
      window.removeEventListener('scroll', close, true);
      clearHold();
    };
  }, [enabled, close]);

  if (!enabled) {
    return { handlers: NOTHING, style: {}, className: '', justGestured: () => false };
  }

  /** Marks the press as answered, so the click that follows is ignored. */
  const answered = () => { answeredAt.current = Date.now(); };

  const announce = (row: HTMLElement | null) => {
    document.dispatchEvent(new CustomEvent(ROW_OPENED, { detail: row }));
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    // Only the primary button, and never a press that began on a control.
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button, a, input, textarea, [role="checkbox"]')) {
      return;
    }
    const row = event.currentTarget;
    rowRef.current = row;
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    decision.current = 'undecided';

    /* A row already open is closed by a press on it, rather than being held
       open while the same press tries to mean something else. */
    if (offset !== 0) { close(); answered(); start.current = null; return; }

    clearHold();
    holdTimer.current = setTimeout(() => {
      if (decision.current !== 'undecided') return;
      start.current = null;
      answered();
      announce(row);
      row.dispatchEvent(new CustomEvent(ROW_PRESS_EVENT, { detail: 'more' }));
    }, PRESS_HOLD_MS);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const from = start.current;
    if (!from || from.id !== event.pointerId) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;

    if (decision.current === 'undecided') {
      if (Math.abs(dx) < PRESS_SLOP_PX && Math.abs(dy) < PRESS_SLOP_PX) return;
      clearHold();
      /* Further sideways than up or down, and leftwards: a swipe. Anything
         else is the page being scrolled, and the row stops listening so the
         browser can get on with it. */
      if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
        decision.current = 'swiping';
        setTracking(true);
        capture(event.currentTarget, event.pointerId, true);
      } else {
        decision.current = 'given-up';
        start.current = null;
        return;
      }
    }

    if (decision.current !== 'swiping') return;
    event.preventDefault();
    // Rightwards past its resting place is nothing: there is no tray that side.
    setOffset(Math.max(-SWIPE_TRAY_PX, Math.min(0, dx)));
  };

  const settle = (event: PointerEvent<HTMLElement>) => {
    clearHold();
    const wasSwiping = decision.current === 'swiping';
    decision.current = 'given-up';
    start.current = null;
    capture(event.currentTarget, event.pointerId, false);
    if (!wasSwiping) return;

    answered();
    setTracking(false);
    if (offset <= -SWIPE_TRAY_PX * SWIPE_COMMIT_RATIO) {
      setOffset(-SWIPE_TRAY_PX);
      announce(event.currentTarget);
    } else {
      setOffset(0);
    }
  };

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: settle,
      onPointerCancel: settle,
    },
    style: offset !== 0
      ? ({ '--swipe': `${offset}px` } as CSSProperties)
      : {},
    className: `${offset !== 0 ? ' swiped' : ''}${tracking ? ' swiping' : ''}`,
    // Long enough to cover the click the browser sends after the press.
    justGestured: () => Date.now() - answeredAt.current < 350,
  };
}
