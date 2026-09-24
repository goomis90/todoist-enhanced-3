import { useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DisplayMenu } from '@/components/DisplayMenu';
import { Icon } from '@/components/Icon';
import { TaskGroup } from '@/components/TaskGroup';
import { ModeSurface } from '@/components/ModeSurface';
import { useT } from '@/hooks/useT';
import { useData } from '@/hooks/useData';
import { useStore } from '@/store/store';
import { viewPrefs } from '@/store/prefs';
import { applyFilters, orderedProjects, rootItems, sortItems } from '@/store/selectors';
import { bucketOf, isQuick } from '@/domain/views';
import { toApiDate, isTomorrow } from '@/domain/dates';
import { summariseLoad } from '@/domain/load';
import type { Item } from '@/domain/types';
import type { TaskPlacement } from '@/domain/dnd';
import { toDisplayPriority } from '@/domain/types';

interface PlanningViewProps {
  onOpen: (id: string) => void;
  onInsights: () => void;
  onUnestimated: () => void;
  onAddTaskTo: (placement: TaskPlacement) => void;
}

const viewKey = 'planning';

/**
 * Today, Tomorrow, then every project, each its own board (or list group)
 * side by side — a fixed layout, not a grouping choice, so it takes no entry
 * in GroupKey the way My week's own fixed layout doesn't either.
 *
 * Today and Tomorrow are date views, not projects: a task keeps its real
 * project underneath the whole time, which is why it can sit in both a date
 * column and its own project's column at once. Dragging it OUT of a date
 * column onto a project is the one case that changes two things in one
 * drop — see dnd.ts's {kind:'planning-project'} for the exact rule, including
 * why a task already sitting in the target project still needs handling
 * (it doesn't move, but it still has to lose the date).
 */
export function PlanningView({ onOpen, onInsights, onUnestimated, onAddTaskTo }: PlanningViewProps) {
  const { t } = useT();
  const { snapshot, items, childrenOf } = useData();
  const prefs = useStore((s) => s.prefs);
  const current = viewPrefs(prefs, viewKey);
  const dragging = useStore((s) => s.draggingTaskId !== null);

  // Today/Tomorrow read every project regardless of the checkbox list below —
  // it decides which project BOARDS show, not which tasks count as due today
  // or tomorrow. Filtering it into this pool too would drop a task from
  // Today/Tomorrow the moment its own project's board was hidden, which
  // defeats the point of a day view: seeing the whole day regardless of
  // which boards are open. Every other filter (priority, tag, estimate…)
  // still applies here as normal.
  const scoped = useMemo(
    () => applyFilters(rootItems(items), { ...current.filters, projects: [] }, snapshot, childrenOf),
    [items, current.filters, snapshot, childrenOf],
  );

  const projects = useMemo(() => {
    const all = orderedProjects(snapshot);
    return current.filters.projects.length === 0
      ? all
      : all.filter((p) => current.filters.projects.includes(p.id));
  }, [snapshot, current.filters.projects]);

  const today = toApiDate(new Date());
  const tomorrowDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const sortedFor = (list: Item[]) => sortItems(list, current.sort, childrenOf, 'day', snapshot);

  const columns = useMemo(() => {
    const now = new Date();
    const todayItems = scoped.filter((item) => {
      const bucket = bucketOf(item, now);
      return bucket === 'overdue' || bucket === 'today';
    });
    const tomorrowItems = scoped.filter((item) => isTomorrow(item, now));
    // Hides a dated task from its project column only — Today/Tomorrow are
    // exactly where a date is the point, so they read `scoped` unfiltered.
    const projectPool = current.filters.hideScheduledInProjects
      ? scoped.filter((item) => !item.due)
      : scoped;

    // Pullein's 2+8: Quick and recurring tasks are the mechanical batch and
    // never counted here, the same reasoning Personal's own grouping uses —
    // what's left is the real, decision-requiring load for the day.
    const realToday = todayItems.filter((item) => !isQuick(item) && !item.due?.is_recurring);
    const p1Count = realToday.filter((item) => toDisplayPriority(item.priority) === 1).length;
    const p2Count = realToday.filter((item) => toDisplayPriority(item.priority) === 2).length;
    const todayWarning = p1Count > 2 || p2Count > 8
      ? t('planning.tooManyToday', { p1: p1Count, p2: p2Count })
      : undefined;

    const cols = [
      {
        id: 'today',
        title: t('nav.today'),
        items: sortedFor(todayItems),
        dropTarget: { kind: 'today' as const },
        onAddTask: () => onAddTaskTo({ date: today }),
        showProject: true,
        accent: 'today' as const,
        capacityMinutes: prefs.dailyCapacity[now.getDay()],
        warning: todayWarning,
      },
      {
        id: 'tomorrow',
        title: t('common.tomorrow'),
        items: sortedFor(tomorrowItems),
        dropTarget: { kind: 'day' as const, date: tomorrowDate },
        onAddTask: () => onAddTaskTo({ date: toApiDate(tomorrowDate) }),
        showProject: true,
        accent: 'tomorrow' as const,
        capacityMinutes: prefs.dailyCapacity[tomorrowDate.getDay()],
        warning: undefined,
      },
      ...projects.map((project) => ({
        id: project.id,
        title: project.name,
        items: sortedFor(projectPool.filter((item) => item.project_id === project.id)),
        dropTarget: { kind: 'planning-project' as const, projectId: project.id },
        onAddTask: () => onAddTaskTo({ projectId: project.id }),
        showProject: false,
        capacityMinutes: undefined,
        warning: undefined,
        accent: undefined,
      })),
    ];
    // Hidden once empty, same as every other board/list group here — but
    // kept (and droppable) for as long as a task is actually in the air, so
    // an empty project (or an empty Tomorrow) is still somewhere to drop
    // the first task into it.
    // Today/Tomorrow hide when empty (and reappear mid-drag, same as Quick
    // elsewhere) — safe, since it's at most two columns changing at once.
    // Project columns never do this: with many projects and the "hide
    // scheduled" filter on, most would empty out together, so grabbing a
    // task would make a dozen columns appear at the same instant and the
    // drag gesture itself would lose its target mid-pointer-capture. Always
    // rendering them costs a look at a handful of quiet columns, not a
    // broken drag.
    return cols.filter((col) => col.id === 'today' || col.id === 'tomorrow'
      ? col.items.length > 0 || dragging
      : true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scoped, projects, current.sort, current.filters.hideScheduledInProjects,
    childrenOf, snapshot, t, today, tomorrowDate, onAddTaskTo, dragging, prefs.dailyCapacity,
  ]);

  const load = useMemo(() => summariseLoad(scoped, childrenOf, null), [scoped, childrenOf]);

  return (
    <div className="page">
      <PageHeader
        title={t('nav.planning')}
        actions={
          <>
            <DisplayMenu viewKey={viewKey} modes={['list', 'board']} groups={['none']} showProjects />
            <button className="btn accent" onClick={onInsights}>
              <Icon name="trend" />
              {t('toolbar.insights')}
            </button>
          </>
        }
        load={load}
        onOpenUnestimated={load.unestimatedCount > 0 ? onUnestimated : undefined}
      />

      {columns.length === 0 && <p className="empty">{t('group.empty')}</p>}

      {current.mode === 'list' ? (
        <div className="mode">
          {columns.map((column) => (
            <TaskGroup
              key={column.id}
              title={column.title}
              items={column.items}
              childrenOf={childrenOf}
              onOpen={onOpen}
              dropTarget={column.dropTarget}
              onAddTask={column.onAddTask}
              showProject={column.showProject}
              accent={column.accent}
              capacityMinutes={column.capacityMinutes}
              warning={column.warning}
            />
          ))}
        </div>
      ) : (
        <ModeSurface
          items={scoped}
          childrenOf={childrenOf}
          mode="board"
          group="none"
          sort={current.sort}
          onOpen={onOpen}
          showProject={false}
          boardColumns={columns}
        />
      )}
    </div>
  );
}
