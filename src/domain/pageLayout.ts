import type { ViewPrefs } from './types';

/**
 * The classes a page takes from its view's Display settings and from the
 * "tasks as cards" setting. Only a list reads them: a board and a table keep
 * the whole page, and a calendar its own grid.
 */
export const pageClass = (view: ViewPrefs, cards = false): string => [
  'page',
  view.mode === 'list' && view.fullWidth !== true && 'narrow',
  view.mode === 'list' && cards && 'cards',
].filter(Boolean).join(' ');
