import type { CSSProperties } from 'react';
import { TaskGroup } from './TaskGroup';
import { TableContext } from './TableContext';
import { useStore } from '@/store/store';
import { useT } from '@/hooks/useT';
import { sortItems } from '@/store/selectors';
import { viewPrefs } from '@/store/prefs';
import { tableColumns, tableColumnLabel, tableColumnSort } from '@/domain/table';
import { effectiveEstimate, formatDuration } from '@/domain/estimates';
import type { Item } from '@/domain/types';
import type { TaskGroupProps } from './TaskGroup';

export function TableSurface({ groups, viewKey, childrenOf, onOpen }: {
  groups: Array<TaskGroupProps>; viewKey: string; childrenOf: (id: string) => Item[]; onOpen: (id: string) => void;
}) {
  const { t, locale } = useT();
  const prefs = useStore((s) => s.prefs);
  const snapshot = useStore((s) => s.snapshot);
  const setViewPrefs = useStore((s) => s.setViewPrefs);
  const current = viewPrefs(prefs, viewKey);
  const columns = tableColumns(current);
  const widths = columns.slice(1).map((column) => column === 'description' ? '240px' : column === 'labels' || column === 'project' ? '160px' : column === 'date' ? '140px' : column === 'deadline' ? '130px' : '110px');
  const all = [...new Map(groups.flatMap((group) => group.items).map((item) => [item.id, item])).values()];
  const total = all.reduce((sum, item) => sum + (effectiveEstimate(item, childrenOf).minutes ?? 0), 0);
  return <TableContext.Provider value={{ columns, coloration: current.tableColoration ?? 'none' }}>
    <div className="table-scroll fullwidth">
      <div className="task-table" style={{ '--table-columns': `18px minmax(240px,1fr) ${widths.join(' ')} 28px`, minWidth: 400 + widths.reduce((sum, width) => sum + parseInt(width), 0) } as CSSProperties}>
        <div className="table-head"><span />{columns.map((column) => <div key={column} aria-sort={tableColumnSort[column] === current.sort ? current.tableDescending ? 'descending' : 'ascending' : 'none'}>
          <button onClick={() => setViewPrefs(viewKey, { sort: tableColumnSort[column],
            tableDescending: current.sort === tableColumnSort[column] ? !current.tableDescending : false })}>
            {t(tableColumnLabel[column])}{tableColumnSort[column] === current.sort ? current.tableDescending ? ' ↓' : ' ↑' : ''}
          </button></div>)}<span /></div>
        {groups.map((group, index) => {
          const sorted = sortItems(group.items, current.sort, childrenOf, group.reorderable || 'project', snapshot);
          return <TaskGroup key={group.sectionId ?? group.title ?? index} {...group} viewKey={viewKey}
            items={current.tableDescending ? sorted.reverse() : sorted} childrenOf={childrenOf} onOpen={onOpen} keepWhenEmpty />;
        })}
        <footer className="table-footer">{t('metrics.tasks', { count: all.length })} · {formatDuration(total, locale)}</footer>
      </div>
    </div>
  </TableContext.Provider>;
}
