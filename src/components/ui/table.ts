import clsx from 'clsx'

export function createTable(className: string | undefined, children: Node[]): HTMLDivElement {
  const outer = document.createElement('div')
  outer.className = 'flow-root'

  const scroll = document.createElement('div')
  scroll.className = clsx(className, '-mx-(--gutter) overflow-x-auto whitespace-nowrap')

  const inner = document.createElement('div')
  inner.className = 'inline-block min-w-full align-middle sm:px-(--gutter)'

  const table = document.createElement('table')
  table.className = 'min-w-full text-left text-sm/6 text-zinc-950 dark:text-white'
  table.append(...children)

  inner.append(table)
  scroll.append(inner)
  outer.append(scroll)
  return outer
}

export function createTableHead(children: Node[]): HTMLTableSectionElement {
  const thead = document.createElement('thead')
  thead.className = 'text-zinc-500 dark:text-zinc-400'
  thead.append(...children)
  return thead
}

export function createTableBody(children: Node[] = []): HTMLTableSectionElement {
  const tbody = document.createElement('tbody')
  tbody.append(...children)
  return tbody
}

export function createTableRow(className: string | undefined, children: Node[]): HTMLTableRowElement {
  const tr = document.createElement('tr')
  if (className) tr.className = className
  tr.append(...children)
  return tr
}

export function createTableHeader(className: string | undefined, children: Node[] = []): HTMLTableCellElement {
  const th = document.createElement('th')
  th.className = clsx(
    className,
    'border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) sm:first:pl-1 sm:last:pr-1 dark:border-b-white/10'
  )
  th.append(...children)
  return th
}

export function createTableCell(className: string | undefined, children: Node[] = []): HTMLTableCellElement {
  const td = document.createElement('td')
  td.className = clsx(
    className,
    'relative px-4 py-4 first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) sm:first:pl-1 sm:last:pr-1',
    'border-b border-zinc-950/5 dark:border-white/5'
  )
  td.append(...children)
  return td
}
