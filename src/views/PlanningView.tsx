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
import { bucketOf } from '@/domain/views';
import { toApiDate } from '@/domain/dates';
import { summariseLoad } from '@/domain/load';
import type { Item } from '@/domain/types';
import type { TaskPlacement } from '@/domain/dnd';

interface PlanningViewProps {
  onOpen: (id: string) => void;
  onInsights: () => void;
  onUnestimated: () => void;
  onAddTaskTo: (placement: TaskPlacement) => void;
}

const viewKey = 'planning';

/**
 * Today, then every project, each its own board (or list group) side by
 * side — a fixed layout, not a grouping choice, so it takes no entry in
 * GroupKey the way My week's own fixed layout doesn't either.
 *
 * Dragging a task from one project's board to another is a plain move (the
 * shared {kind:'project'} target, same as everywhere else in the app).
 * Dragging out of Today is not plain: Today is a date, not a project, so a
 * task leaving it also drops today's date (dnd.ts's {kind:'planning-project'}
 * target does both in one command). Dragging INTO Today only ever adds
 * today's date — never a move — so the task stays on its own project's board
 * too. See src/domain/dnd.ts for the exact rule.
 */
export function PlanningView({ onOpen, onInsights, onUnestimated, onAddTaskTo }: PlanningViewProps) {
  const { t } = useT();
  const { snapshot, items, childrenOf } = useData();
  const prefs = useStore((s) => s.prefs);
  const current = viewPrefs(prefs, viewKey);
  const dragging = useStore((s) => s.draggingTaskId !== null);

  const scoped = useMemo(
    () => applyFilters(rootItems(items), current.filters, snapshot, childrenOf),
    [items, current.filters, snapshot, childrenOf],
  );

  const projects = useMemo(() => {
    const all = orderedProjects(snapshot);
    return current.filters.projects.length === 0
      ? all
      : all.filter((p) => current.filters.projects.includes(p.id));
  }, [snapshot, current.filters.projects]);

  const today = toApiDate(new Date());
  const sortedFor = (list: Item[]) => sortItems(list, current.sort, childrenOf, 'day', snapshot);

  const columns = useMemo(() => {
    const now = new Date();
    const todayItems = scoped.filter((item) => {
      const bucket = bucketOf(item, now);
      return bucket === 'overdue' || bucket === 'today';
    });

    const cols = [
      {
        id: 'today',
        title: t('nav.today'),
        items: sortedFor(todayItems),
        dropTarget: { kind: 'today' as const },
        onAddTask: () => onAddTaskTo({ date: today }),
      },
      ...projects.map((project) => ({
        id: project.id,
        title: project.name,
        items: sortedFor(scoped.filter((item) => item.project_id === project.id)),
        dropTarget: { kind: 'planning-project' as const, projectId: project.id },
        onAddTask: () => onAddTaskTo({ projectId: project.id }),
      })),
    ];
    // Hidden once empty, same as every other board/list group here — but
    // kept (and droppable) for as long as a task is actually in the air, so
    // an empty project is still somewhere to drop the first task into it.
    return cols.filter((col) => col.items.length > 0 || dragging);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoped, projects, current.sort, childrenOf, snapshot, t, today, onAddTaskTo, dragging]);

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
