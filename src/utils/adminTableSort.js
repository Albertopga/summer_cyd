/**
 * Utilidades reutilizables para ordenar tablas del panel admin.
 *
 * Uso típico:
 * 1. Define sortKey / sortMode en cada columna.
 * 2. useAdminTableSort() gestiona el estado al pulsar cabeceras.
 * 3. resolveServerSortQuery() → parámetros para la API.
 * 4. sortRowsByColumn() → orden en cliente cuando sortMode === 'client'.
 */

/** @typedef {'asc' | 'desc'} SortDirection */

/**
 * @typedef {Object} SortState
 * @property {string|null} columnId
 * @property {SortDirection} direction
 * @property {Array<{ columnId: string, direction: SortDirection }>} [secondary]
 */

/**
 * @typedef {Object} AdminTableColumnSortConfig
 * @property {string} id
 * @property {boolean} [tableOnly]
 * @property {boolean} [sortable]
 * @property {'server' | 'client'} [sortMode='server']
 * @property {string} [sortKey] - Campo remoto / de fila distinto del id de columna.
 */

/**
 * @param {AdminTableColumnSortConfig} column
 * @returns {boolean}
 */
export function isSortableColumn(column) {
  if (!column || column.tableOnly || column.sortable === false) {
    return false
  }
  return column.sortMode === 'client' || Boolean(column.sortKey || column.id)
}

/**
 * @param {SortState} current
 * @param {string} columnId
 * @param {{ sortableColumnIds?: string[] }} [options]
 * @returns {SortState}
 */
export function toggleSortState(current, columnId, options = {}) {
  const { sortableColumnIds = [] } = options
  if (!sortableColumnIds.includes(columnId)) {
    return current
  }

  if (current.columnId === columnId && !(current.secondary?.length > 0)) {
    return {
      columnId,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
      secondary: [],
    }
  }

  return {
    columnId,
    direction: 'asc',
    secondary: [],
  }
}

/**
 * @param {SortState} sortState
 * @param {(columnId: string) => AdminTableColumnSortConfig|undefined} getColumnDefinition
 * @returns {{ mode: 'server', orderBy: string, ascending: string | boolean } | null}
 */
export function resolveServerSortQuery(sortState, getColumnDefinition) {
  if (!sortState?.columnId) {
    return null
  }

  const primaryColumn = getColumnDefinition(sortState.columnId)
  if (!primaryColumn || primaryColumn.sortMode === 'client') {
    return null
  }

  const fields = []
  const ascendingParts = []

  const appendField = (column, direction) => {
    if (!column || column.sortMode === 'client') return
    fields.push(column.sortKey || column.id)
    ascendingParts.push(direction === 'asc')
  }

  appendField(primaryColumn, sortState.direction)

  for (const secondary of sortState.secondary || []) {
    appendField(getColumnDefinition(secondary.columnId), secondary.direction)
  }

  if (fields.length === 0) {
    return null
  }

  if (fields.length === 1) {
    return {
      mode: 'server',
      orderBy: fields[0],
      ascending: ascendingParts[0],
    }
  }

  return {
    mode: 'server',
    orderBy: fields.join(','),
    ascending: ascendingParts.map(String).join(','),
  }
}

/**
 * @param {SortState} sortState
 * @param {(columnId: string) => AdminTableColumnSortConfig|undefined} getColumnDefinition
 * @returns {boolean}
 */
export function needsClientSort(sortState, getColumnDefinition) {
  if (!sortState?.columnId) return false
  const column = getColumnDefinition(sortState.columnId)
  return column?.sortMode === 'client'
}

/**
 * @param {unknown} value
 * @returns {'null' | 'number' | 'boolean' | 'date' | 'string'}
 */
function getValueKind(value) {
  if (value == null || value === '') return 'null'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (value instanceof Date) return 'date'
  if (typeof value === 'string') {
    const timestamp = Date.parse(value)
    if (!Number.isNaN(timestamp) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return 'date'
    }
    return 'string'
  }
  return 'string'
}

/**
 * @param {unknown} left
 * @param {unknown} right
 * @returns {number}
 */
export function compareSortValues(left, right) {
  const leftKind = getValueKind(left)
  const rightKind = getValueKind(right)

  if (leftKind === 'null' && rightKind === 'null') return 0
  if (leftKind === 'null') return 1
  if (rightKind === 'null') return -1

  if (leftKind === 'number' && rightKind === 'number') {
    return left - right
  }

  if (leftKind === 'boolean' && rightKind === 'boolean') {
    return Number(left) - Number(right)
  }

  if (leftKind === 'date' && rightKind === 'date') {
    const leftTime = left instanceof Date ? left.getTime() : Date.parse(String(left))
    const rightTime = right instanceof Date ? right.getTime() : Date.parse(String(right))
    return leftTime - rightTime
  }

  return String(left).localeCompare(String(right), 'es', { sensitivity: 'base', numeric: true })
}

/**
 * @template T
 * @param {T[]} rows
 * @param {SortState} sortState
 * @param {(columnId: string, row: T) => unknown} getSortValue
 * @returns {T[]}
 */
export function sortRowsByColumn(rows, sortState, getSortValue) {
  if (!sortState?.columnId || !Array.isArray(rows)) {
    return rows
  }

  const directionMultiplier = sortState.direction === 'asc' ? 1 : -1

  return [...rows].sort((leftRow, rightRow) => {
    const leftValue = getSortValue(sortState.columnId, leftRow)
    const rightValue = getSortValue(sortState.columnId, rightRow)
    return compareSortValues(leftValue, rightValue) * directionMultiplier
  })
}

/**
 * @param {string|null|undefined} columnId
 * @param {SortState} sortState
 * @returns {'ascending' | 'descending' | 'none'}
 */
export function getHeaderAriaSort(columnId, sortState) {
  if (!columnId || sortState.columnId !== columnId) {
    return 'none'
  }
  return sortState.direction === 'asc' ? 'ascending' : 'descending'
}

/**
 * @param {string|null|undefined} columnId
 * @param {SortState} sortState
 * @returns {string}
 */
export function getSortIndicator(columnId, sortState) {
  if (!columnId || sortState.columnId !== columnId) {
    return ''
  }
  return sortState.direction === 'asc' ? '▲' : '▼'
}

/**
 * @param {AdminTableColumnSortConfig} column
 * @param {SortState} sortState
 * @returns {string}
 */
export function getSortButtonLabel(column, sortState) {
  const directionLabel =
    sortState.columnId === column.id
      ? sortState.direction === 'asc'
        ? 'ascendente'
        : 'descendente'
      : 'sin ordenar'
  return `Ordenar por ${column.label}, ${directionLabel}`
}
