import type { ReactNode } from 'react'
import { ScientificNotationText } from './ScientificNotationText'

export type TableAlign = 'start' | 'center' | 'end'

export type ScientificColumn = {
  /** Key into each row's `cells` record. */
  key: string
  header: ReactNode
  /** Unit or qualifier shown under the header, e.g. `kg`. */
  unit?: ReactNode
  align?: TableAlign
  /** Numeric columns are tabular and right-aligned by default. */
  numeric?: boolean
  /** Renders body cells of this column as row headers (`th scope="row"`). */
  rowHeader?: boolean
  width?: string
}

export type ScientificRow = {
  id: string
  cells: Record<string, ReactNode>
  /** The row the user has selected; styling is driven by state, not by hover. */
  selected?: boolean
  /** The row currently being measured/manipulated (e.g. by a simulation). */
  active?: boolean
}

export type ScientificTableProps = {
  /** Always rendered into <caption> so the table has an accessible name. */
  caption: string
  /** Hide the caption visually while keeping it for assistive technology. */
  hideCaption?: boolean
  columns: ScientificColumn[]
  rows: ScientificRow[]
  density?: 'comfortable' | 'compact'
  stickyHeader?: boolean
  /** Rendered under the table: sources, notes, units legend. */
  footnote?: ReactNode
  className?: string
}

const ALIGN_CLASS: Record<TableAlign, string> = {
  start: 'is-start',
  center: 'is-center',
  end: 'is-end',
}

/**
 * The platform's scientific data table.
 *
 * Every surface — table background, header background, header text, body text,
 * borders, hover, selected and active states — resolves to an explicit design
 * token, so table text can never collide with a background and the same table
 * stays readable in both themes (see styles/components.css and the token
 * contract test).
 *
 * Numerical cells use tabular figures so decimal points line up, and units are
 * rendered in isolated LTR runs by the caller-provided cell content.
 */
export function ScientificTable({
  caption,
  hideCaption = false,
  columns,
  rows,
  density = 'comfortable',
  stickyHeader = false,
  footnote,
  className,
}: ScientificTableProps) {
  const hasHeaderUnits = columns.some((column) => column.unit !== undefined && column.unit !== null)

  return (
    <div className={['sci-table-wrapper', className].filter(Boolean).join(' ')}>
      <table
        className={['sci-table', `sci-table--${density}`, stickyHeader ? 'sci-table--sticky' : null]
          .filter(Boolean)
          .join(' ')}
        data-rows={String(rows.length)}
        data-columns={String(columns.length)}
      >
        <caption className={hideCaption ? 'visually-hidden' : 'sci-table__caption'}>
          <ScientificNotationText as="span">{caption}</ScientificNotationText>
        </caption>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => {
              const align = column.align ?? (column.numeric ? 'end' : 'start')
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={['sci-table__head', ALIGN_CLASS[align], column.numeric ? 'is-numeric' : null]
                    .filter(Boolean)
                    .join(' ')}
                  data-column={column.key}
                >
                  <span className="sci-table__head-label">{column.header}</span>
                  {hasHeaderUnits ? (
                    <span className="sci-table__head-unit" dir="ltr" data-sci="isolated">
                      {column.unit ?? ''}
                    </span>
                  ) : null}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="sci-table__row"
              data-row={row.id}
              data-selected={row.selected ? 'true' : undefined}
              data-active={row.active ? 'true' : undefined}
            >
              {columns.map((column) => {
                const align = column.align ?? (column.numeric ? 'end' : 'start')
                const classes = [
                  column.rowHeader ? 'sci-table__row-head' : 'sci-table__cell',
                  ALIGN_CLASS[align],
                  column.numeric ? 'is-numeric' : null,
                ]
                  .filter(Boolean)
                  .join(' ')

                const content = row.cells[column.key] ?? null

                return column.rowHeader ? (
                  <th
                    key={column.key}
                    scope="row"
                    className={classes}
                    data-column={column.key}
                    data-row={row.id}
                  >
                    {content}
                  </th>
                ) : (
                  <td
                    key={column.key}
                    className={classes}
                    data-column={column.key}
                    data-row={row.id}
                    {...(column.numeric ? { 'data-numeric': 'true' } : {})}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {footnote ? <p className="sci-table__footnote">{footnote}</p> : null}
    </div>
  )
}
