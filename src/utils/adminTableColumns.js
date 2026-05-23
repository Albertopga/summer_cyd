/**
 * Utilidades compartidas para configuración de columnas en tablas admin.
 */

/**
 * @param {Array} definitions
 * @param {string} storageKey
 */
export function createAdminTableColumnConfig(definitions, storageKey) {
  const definitionsById = new Map(definitions.map((col) => [col.id, col]))

  const getColumnDefinition = (columnId) => definitionsById.get(columnId)

  const getConfigurableColumns = () =>
    definitions.filter((column) => !column.pinned && !column.alwaysVisible)

  const getDefaultColumnPreferences = () => ({
    order: getConfigurableColumns().map((column) => column.id),
    hidden: getConfigurableColumns()
      .filter((column) => column.defaultVisible === false)
      .map((column) => column.id),
  })

  const mergeColumnOrder = (savedOrder) => {
    const defaultOrder = getDefaultColumnPreferences().order
    const knownIds = new Set(getConfigurableColumns().map((column) => column.id))
    const merged = []

    for (const id of savedOrder) {
      if (knownIds.has(id) && !merged.includes(id)) {
        merged.push(id)
      }
    }

    for (const id of defaultOrder) {
      if (!merged.includes(id)) {
        merged.push(id)
      }
    }

    return merged
  }

  const loadColumnPreferences = () => {
    const defaults = getDefaultColumnPreferences()

    if (typeof window === 'undefined') {
      return defaults
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return defaults

      const parsed = JSON.parse(raw)
      const order = Array.isArray(parsed.order) ? mergeColumnOrder(parsed.order) : defaults.order
      const hidden = Array.isArray(parsed.hidden)
        ? parsed.hidden.filter((id) => definitionsById.has(id))
        : defaults.hidden

      return { order, hidden }
    } catch {
      return defaults
    }
  }

  const saveColumnPreferences = (preferences) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify(preferences))
  }

  const isColumnHidden = (columnId, hiddenSet) => {
    const definition = getColumnDefinition(columnId)
    if (!definition || definition.alwaysVisible) return false
    return hiddenSet.has(columnId)
  }

  const resolveTableColumns = (preferences) => {
    const hiddenSet = new Set(preferences.hidden)
    const pinnedStart = definitions.filter((column) => column.pinned === 'start')
    const pinnedEnd = definitions.filter((column) => column.pinned === 'end')

    const middle = preferences.order
      .map((id) => getColumnDefinition(id))
      .filter((column) => column && !column.pinned && !isColumnHidden(column.id, hiddenSet))

    return [...pinnedStart, ...middle, ...pinnedEnd]
  }

  const resolveExportColumns = (preferences) => {
    const hiddenSet = new Set(preferences.hidden)

    return preferences.order
      .map((id) => getColumnDefinition(id))
      .filter(
        (column) =>
          column &&
          !column.tableOnly &&
          column.exportable !== false &&
          !isColumnHidden(column.id, hiddenSet),
      )
  }

  const getColumnTableStyle = (column) => {
    if (!column?.tableWidth) return undefined
    return {
      width: column.tableWidth,
      minWidth: column.tableWidth,
    }
  }

  return {
    definitions,
    storageKey,
    getColumnDefinition,
    getConfigurableColumns,
    getDefaultColumnPreferences,
    loadColumnPreferences,
    saveColumnPreferences,
    resolveTableColumns,
    resolveExportColumns,
    getColumnTableStyle,
  }
}
