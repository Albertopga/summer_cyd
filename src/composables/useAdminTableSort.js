import { computed, ref } from 'vue'
import {
  getHeaderAriaSort,
  getSortButtonLabel,
  getSortIndicator,
  isSortableColumn,
  needsClientSort,
  resolveServerSortQuery,
  sortRowsByColumn,
  toggleSortState,
} from '@/utils/adminTableSort'

/**
 * Composable reutilizable para cabeceras ordenables en tablas admin.
 *
 * @template TRow
 * @param {Object} options
 * @param {import('vue').MaybeRefOrGetter<Array<import('@/utils/adminTableSort').AdminTableColumnSortConfig>>} options.columns
 * @param {(columnId: string) => import('@/utils/adminTableSort').AdminTableColumnSortConfig|undefined} options.getColumnDefinition
 * @param {(columnId: string, row: TRow) => unknown} [options.getClientSortValue]
 * @param {import('@/utils/adminTableSort').SortState} [options.defaultSort]
 */
export function useAdminTableSort(options) {
  const {
    columns,
    getColumnDefinition,
    getClientSortValue = () => '',
    defaultSort = { columnId: 'created_at', direction: 'desc', secondary: [] },
  } = options

  /** @type {import('vue').Ref<import('@/utils/adminTableSort').SortState>} */
  const sortState = ref({
    columnId: defaultSort.columnId,
    direction: defaultSort.direction,
    secondary: defaultSort.secondary ? [...defaultSort.secondary] : [],
  })

  const sortableColumns = computed(() => {
    const columnList = typeof columns === 'function' ? columns() : columns
    return columnList.filter(isSortableColumn)
  })

  const sortableColumnIds = computed(() => sortableColumns.value.map((column) => column.id))

  const handleHeaderSort = (columnId) => {
    sortState.value = toggleSortState(sortState.value, columnId, {
      sortableColumnIds: sortableColumnIds.value,
    })
  }

  const resolveFetchSort = () => resolveServerSortQuery(sortState.value, getColumnDefinition)

  const applySortToRows = (rows) => {
    if (!needsClientSort(sortState.value, getColumnDefinition)) {
      return rows
    }
    return sortRowsByColumn(rows, sortState.value, getClientSortValue)
  }

  const isColumnSortable = (column) => isSortableColumn(column)

  const getColumnAriaSort = (columnId) => getHeaderAriaSort(columnId, sortState.value)

  const getColumnSortIndicator = (columnId) => getSortIndicator(columnId, sortState.value)

  const getColumnSortLabel = (column) => getSortButtonLabel(column, sortState.value)

  return {
    sortState,
    sortableColumns,
    handleHeaderSort,
    resolveFetchSort,
    applySortToRows,
    isColumnSortable,
    getColumnAriaSort,
    getColumnSortIndicator,
    getColumnSortLabel,
  }
}
