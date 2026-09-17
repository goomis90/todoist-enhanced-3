/**
 * The gestures a phone has and a desktop does not.
 *
 * A row on a desktop reveals its controls when the pointer is over it. A phone
 * has no pointer to be over anything, and the answer the app shipped with was
 * to take the controls away — which left a task row on a phone with nothing on
 * it but the tick and the words. The two gestures every phone already uses for
 * exactly this put them back:
 *
 * - **swipe**, which slides the row aside to show its buttons; and
 * - **press and hold**, which opens what hovering would have shown, as a sheet
 *   with the actions' names on it rather than a row of glyphs.
 *
 * They are driven by pointer events, not touch events, so a mouse in a narrow
 * window raises them too — which is where the phone layout is actually worked
 * on, and a gesture you cannot try is a gesture you cannot finish.
 */

/** Which of a row's menus a press asked for. */
export type RowMenu = 'schedule' | 'move' | 'more';

/**
 * Sent to a task row's own element when it has been held down.
 *
 * The row is a DOM node long before the component inside it that owns the menu
 * state is reachable from here, and the message is for one row: a context
 * would re-render every other row on the page to tell this one.
 */
export const ROW_PRESS_EVENT = 'enhanced:rowpress';

/** How long a press has to be held before it means "this one". */
export const PRESS_HOLD_MS = 420;

/**
 * How far a press may stray and still be a press.
 *
 * Past it in either direction the gesture is a movement, and which movement it
 * is depends on the direction: sideways is a swipe, and up or down is the page
 * scrolling, which the row must not take.
 */
export const PRESS_SLOP_PX = 10;

/**
 * How far the row slides to show its buttons.
 *
 * Three targets at 44px with the gaps between them: the width the tray needs,
 * rather than a round number the tray is then made to fit.
 */
export const SWIPE_TRAY_PX = 152;

/**
 * How much of the tray has to be pulled out before letting go opens it rather
 * than putting it back. Under half, so the gesture completes itself.
 */
export const SWIPE_COMMIT_RATIO = 0.4;
