import { Overlay } from './Overlay';
import { useT } from '@/hooks/useT';
import type { TranslationKey } from '@/i18n';

interface ShortcutsProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The keys as they are pressed.
 *
 * Keys side by side are one row's keys — a chord to hold down, or a range to
 * choose from, and the label says which. A second group is a different way of
 * doing the same thing, and gets the word for it rather than a gap the reader
 * has to interpret.
 */
const Keys = ({ groups, or }: { groups: string[][]; or: string }) => (
  <span className="keys">
    {groups.map((chord, at) => (
      <span className="chord" key={chord.join('')}>
        {at > 0 && <small>{or}</small>}
        {chord.map((key) => <kbd key={key}>{key}</kbd>)}
      </span>
    ))}
  </span>
);

/* Todoist's own keys, wherever Todoist has one. Anyone arriving here has years
   of finger memory for them and spending it on a different mapping buys
   nothing; the only ones invented are the ones Todoist has no equivalent for. */
type Row = [groups: string[][], label: TranslationKey];

const SECTIONS: Array<{ title: TranslationKey; rows: Row[] }> = [
  {
    title: 'keys.anywhere',
    rows: [
      [[['Q']], 'nav.addTask'],
      [[['/'], ['⌘', 'K']], 'nav.search'],
      [[['⌘', 'Z']], 'common.undo'],
      [[['⌘', '↵']], 'keys.saveTask'],
      [[['?']], 'keys.thisList'],
    ],
  },
  {
    title: 'keys.goTo',
    rows: [
      [[['G', 'W']], 'nav.week'],
      [[['G', 'T']], 'nav.today'],
      [[['G', 'U']], 'nav.upcoming'],
      [[['G', 'S']], 'nav.someday'],
      [[['G', 'I']], 'nav.inbox'],
      [[['G', 'R']], 'nav.review'],
      [[['G', 'L']], 'nav.labels'],
      [[['G', 'A']], 'nav.insights'],
      [[['G', ',']], 'nav.settings'],
    ],
  },
  {
    title: 'keys.moving',
    rows: [
      [[['↑', '↓']], 'keys.moveCursor'],
      [[['J', 'K']], 'keys.moveCursorAlt'],
      [[['Esc']], 'keys.dropCursor'],
    ],
  },
  {
    title: 'keys.onATask',
    rows: [
      [[['↵']], 'keys.openTask'],
      [[['E']], 'task.complete'],
      [[['T']], 'task.schedule'],
      [[['⇧', 'T']], 'task.removeDate'],
      [[['V']], 'task.moveToProject'],
      [[['1', '2', '3', '4']], 'keys.setPriority'],
      [[['X']], 'keys.select'],
      [[['.']], 'task.moreActions'],
      [[['⌘', '⌫']], 'task.delete'],
    ],
  },
  {
    title: 'keys.inAnOpenTask',
    rows: [
      [[['P']], 'detail.project'],
      [[['T']], 'detail.startDate'],
      [[['D']], 'detail.deadline'],
      [[['E']], 'detail.estimate'],
      [[['Y']], 'detail.priority'],
      [[['L']], 'detail.labels'],
      [[['.']], 'task.moreActions'],
      [[['⌘', '⌫']], 'task.delete'],
      [[['Esc']], 'detail.close'],
    ],
  },
];

/**
 * What the keyboard can do, on the key Todoist puts it on.
 *
 * Shortcuts nobody can find are shortcuts nobody has. `?` is where Todoist
 * keeps this list, so it is where this one is.
 */
export function Shortcuts({ open, onClose }: ShortcutsProps) {
  const { t } = useT();

  return (
    <Overlay open={open} onClose={onClose} label={t('keys.title')} size="md">
      <div className="keyssheet">
        <h2>{t('keys.title')}</h2>
        <p className="keyshint">{t('keys.typingHint')}</p>

        <div className="keyscols">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h5>{t(section.title)}</h5>
              {section.rows.map(([groups, label]) => (
                <div className="keysrow" key={label + groups.flat().join('')}>
                  <span>{t(label)}</span>
                  <Keys groups={groups} or={t('keys.or')} />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Overlay>
  );
}
