import { describe, expect, test } from 'vitest'
import {
  compareSortValues,
  getHeaderAriaSort,
  getSortIndicator,
  isSortableColumn,
  needsClientSort,
  resolveServerSortQuery,
  sortRowsByColumn,
  toggleSortState,
} from './adminTableSort'

const columns = {
  name: { id: 'name', sortKey: 'full_name' },
  total: { id: 'total', sortMode: 'client' },
  select: { id: 'select', tableOnly: true },
}

describe('adminTableSort', () => {
  test('isSortableColumn excluye columnas solo de tabla', () => {
    expect(isSortableColumn(columns.select)).toBe(false)
    expect(isSortableColumn(columns.name)).toBe(true)
    expect(isSortableColumn(columns.total)).toBe(true)
  })

  test('toggleSortState alterna dirección en la misma columna', () => {
    const first = toggleSortState(
      { columnId: 'name', direction: 'asc', secondary: [] },
      'name',
      { sortableColumnIds: ['name'] },
    )
    expect(first.direction).toBe('desc')

    const second = toggleSortState(first, 'name', { sortableColumnIds: ['name'] })
    expect(second.direction).toBe('asc')
  })

  test('toggleSortState reinicia en asc al cambiar de columna', () => {
    const next = toggleSortState(
      { columnId: 'name', direction: 'desc', secondary: [] },
      'email',
      { sortableColumnIds: ['name', 'email'] },
    )
    expect(next).toEqual({ columnId: 'email', direction: 'asc', secondary: [] })
  })

  test('resolveServerSortQuery soporta orden compuesto', () => {
    const query = resolveServerSortQuery(
      {
        columnId: 'accommodation_paid',
        direction: 'asc',
        secondary: [{ columnId: 'created_at', direction: 'asc' }],
      },
      (columnId) =>
        ({
          accommodation_paid: { id: 'accommodation_paid' },
          created_at: { id: 'created_at' },
        })[columnId],
    )

    expect(query).toEqual({
      mode: 'server',
      orderBy: 'accommodation_paid,created_at',
      ascending: 'true,true',
    })
  })

  test('needsClientSort detecta columnas calculadas', () => {
    expect(
      needsClientSort({ columnId: 'total', direction: 'asc', secondary: [] }, () => columns.total),
    ).toBe(true)
    expect(
      needsClientSort({ columnId: 'name', direction: 'asc', secondary: [] }, () => columns.name),
    ).toBe(false)
  })

  test('sortRowsByColumn ordena valores numéricos y texto', () => {
    const rows = [{ amount: 20 }, { amount: 5 }, { amount: 12 }]
    const sorted = sortRowsByColumn(
      rows,
      { columnId: 'amount', direction: 'asc', secondary: [] },
      (_, row) => row.amount,
    )
    expect(sorted.map((row) => row.amount)).toEqual([5, 12, 20])
  })

  test('compareSortValues deja nulos al final', () => {
    expect(compareSortValues(null, 'a')).toBeGreaterThan(0)
    expect(compareSortValues('a', null)).toBeLessThan(0)
  })

  test('getHeaderAriaSort y getSortIndicator reflejan el estado activo', () => {
    const state = { columnId: 'email', direction: 'desc', secondary: [] }
    expect(getHeaderAriaSort('email', state)).toBe('descending')
    expect(getSortIndicator('email', state)).toBe('▼')
    expect(getHeaderAriaSort('name', state)).toBe('none')
  })
})
