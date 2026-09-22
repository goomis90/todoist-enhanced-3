import { SYSTEM_LABELS, toDisplayPriority, weekLabel, type Bucket, type Item } from './types';
import { estimateOf } from './estimates';
import { dueDate, hasTime, isFuture, isOverdue, isToday, toApiDate } from './dates';

/** Case-insensitive label test, so `Week` and `week` behave the same. */
export const hasLabel = (item: Item, label: string): boolean =>
  item.labels.some((l) => l.toLowerCase() === label.toLowerCase());

export const QUICK_THRESHOLD_MINUTES = 5;

/**
 * Quick holds tasks that take under five minutes.
 *
 * The estimate is the fact and the `quick` tag is a claim: a task tagged quick
 * but estimated at forty minutes is not quick, so it stays out of the group
 * and is reported as a conflict instead. Without an estimate the tag is all
 * there is to go on.
 */
export function isQuick(item: Item): boolean {
  const est = estimateOf(item);
  if (est !== null && est > QUICK_THRESHOLD_MINUTES) return false;
  if (hasLabel(item, SYSTEM_LABELS.quick)) return true;
  return est !== null && est < QUICK_THRESHOLD_MINUTES;
}

/**
 * The single rule that decides where a task appears.
 *
 * A real date always wins over the `week` label; nothing is ever corrected
 * silently, so a task carrying both is placed by its date and separately
 * surfaces as a conflict.
 */
export function bucketOf(item: Item, now = new Date()): Bucket {
  if (item.due) {
    if (isOverdue(item, now)) return 'overdue';
    if (isToday(item, now)) return 'today';
    if (isFuture(item, now)) return 'upcoming';
  }
  return hasLabel(item, weekLabel()) ? 'anytime' : 'someday';
}

/** Tasks that are open: not completed, not deleted. */
export const isOpen = (item: Item): boolean => !item.checked && !item.is_deleted;

/** The Personal layout for Today: priority and routine split out from the plain "today" bucket. */
export interface PersonalTodayGroups {
  overdue: Item[];
  quick: Item[];
  /** Only populated when groupWeekPersonal is asked to check it. */
  deadline: Item[];
  p1: Item[];
  p2: Item[];
  p3: Item[];
  routines: Item[];
  timed: Item[];
}

/**
 * Same shape of pull-out as groupWeek — overdue stays one lump bucket, quick
 * is pulled out first regardless of priority — but what groupWeek leaves as
 * one "Today" bucket is split further: a task with a specific time is a fixed
 * appointment and goes to Scheduled today, same as in the default layout, so
 * it stays reviewable by time rather than getting buried among routines you
 * could do right now. Only an untimed recurring task counts as a routine.
 * What's left is sorted into P1/P2/P3 — P3 also catching P4 and unprioritised
 * tasks, so nothing here is dropped for lack of its own board.
 *
 * checkDeadline mirrors groupWeek's own: Deadline wins over Quick/Scheduled/
 * priority, but Behind schedule (overdue) still wins over Deadline.
 */
export function groupWeekPersonal(
  items: Item[], now = new Date(), showQuickGroup = true, checkDeadline = false,
): PersonalTodayGroups {
  const groups: PersonalTodayGroups = {
    overdue: [], quick: [], deadline: [], p1: [], p2: [], p3: [], routines: [], timed: [],
  };
  const todayStr = toApiDate(now);

  for (const item of items) {
    const bucket = bucketOf(item, now);
    if (bucket === 'overdue') {
      groups.overdue.push(item);
    } else if (checkDeadline && item.deadline?.date === todayStr) {
      groups.deadline.push(item);
    } else if (bucket === 'today') {
      if (showQuickGroup && isQuick(item)) groups.quick.push(item);
      else if (hasTime(item.due)) groups.timed.push(item);
      else if (item.due?.is_recurring) groups.routines.push(item);
      else {
        const p = toDisplayPriority(item.priority);
        if (p === 1) groups.p1.push(item);
        else if (p === 2) groups.p2.push(item);
        else groups.p3.push(item);
      }
    }
  }

  const byTime = (a: Item, b: Item) =>
    (dueDate(a)?.getTime() ?? 0) - (dueDate(b)?.getTime() ?? 0);
  groups.timed.sort(byTime);
  groups.overdue.sort(byTime);

  return groups;
}

/**
 * My week, assembled in the order the spec fixes: behind schedule, then quick,
 * then today without a time, then today with a time, and finally the flexible
 * "anytime this week" tasks.
 *
 * Quick absorbs today's quick tasks so none is listed twice; overdue tasks stay
 * in Behind schedule even when they are quick, because lateness is the more
 * urgent fact about them.
 */
export interface WeekGroups {
  overdue: Item[];
  quick: Item[];
  /** Only populated when groupWeek is asked to check it — see checkDeadline. */
  deadline: Item[];
  untimed: Item[];
  timed: Item[];
  anytime: Item[];
}

/**
 * checkDeadline (Today page only — My week never passes it) pulls out
 * anything whose Deadline field is today, ahead of Quick/Scheduled/priority,
 * so a task isn't shown twice. Overdue still wins over everything: a task
 * overdue on its own due date belongs in Behind schedule even if its
 * deadline is today too. Deadline is checked before the due-date bucket
 * decides anything else, so it also catches a deadline-today task whose due
 * date is next week or unset — items like that only reach this function at
 * all because the caller widened its own item pool to include them.
 */
export function groupWeek(
  items: Item[], now = new Date(), showQuickGroup = true, checkDeadline = false,
): WeekGroups {
  const groups: WeekGroups = { overdue: [], quick: [], deadline: [], untimed: [], timed: [], anytime: [] };
  const todayStr = toApiDate(now);

  for (const item of items) {
    const bucket = bucketOf(item, now);
    if (bucket === 'overdue') {
      groups.overdue.push(item);
    } else if (checkDeadline && item.deadline?.date === todayStr) {
      groups.deadline.push(item);
    } else if (bucket === 'today') {
      if (showQuickGroup && isQuick(item)) groups.quick.push(item);
      else if (hasTime(item.due)) groups.timed.push(item);
      else groups.untimed.push(item);
    } else if (bucket === 'anytime') {
      groups.anytime.push(item);
    }
  }

  const byTime = (a: Item, b: Item) =>
    (dueDate(a)?.getTime() ?? 0) - (dueDate(b)?.getTime() ?? 0);
  groups.timed.sort(byTime);
  groups.overdue.sort(byTime);

  return groups;
}

/** Everything the Upcoming view shows: strictly future dates, within a horizon. */
export function upcomingItems(items: Item[], now = new Date()): Item[] {
  return items.filter((i) => bucketOf(i, now) === 'upcoming');
}

/** Someday / backlog: no date and no `week` commitment. */
export function somedayItems(items: Item[], now = new Date()): Item[] {
  return items.filter((i) => bucketOf(i, now) === 'someday');
}

/** Anytime this week: no date, carrying `week`. */
export function anytimeItems(items: Item[], now = new Date()): Item[] {
  return items.filter((i) => bucketOf(i, now) === 'anytime');
}

/** Everything My week covers, used for the header counts and the load pill. */
export function weekItems(items: Item[], now = new Date()): Item[] {
  return items.filter((i) => {
    const b = bucketOf(i, now);
    return b === 'overdue' || b === 'today' || b === 'anytime';
  });
}
