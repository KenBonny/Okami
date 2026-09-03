import clsx from 'clsx'

export function createSwitchField(className: string | undefined, children: Node[]): HTMLDivElement {
  const field = document.createElement('div')
  field.dataset.slot = 'field'
  field.className = clsx(
    className,
    'grid grid-cols-[1fr_auto] gap-x-8 gap-y-1 sm:grid-cols-[1fr_auto]',
    '*:data-[slot=control]:col-start-2 *:data-[slot=control]:self-start sm:*:data-[slot=control]:mt-0.5',
    '*:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1'
  )
  field.append(...children)
  return field
}

const colors = {
  amber: [
    '[--switch-bg-ring:var(--color-amber-500)]/80 [--switch-bg:var(--color-amber-400)] dark:[--switch-bg-ring:transparent]',
    '[--switch-ring:transparent] [--switch-shadow:transparent] [--switch:var(--color-amber-950)]',
  ],
}

type Color = keyof typeof colors

export interface SwitchOptions {
  name?: string
  color?: Color
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export function createSwitch(options: SwitchOptions): HTMLInputElement {
  const { name, color = 'amber', checked = false, onChange } = options

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('role', 'switch')
  if (name) input.name = name
  input.checked = checked
  input.dataset.slot = 'control'
  input.className = clsx(
    'relative isolate inline-flex h-6 w-10 shrink-0 cursor-default appearance-none rounded-full sm:h-5 sm:w-8',
    'transition duration-0 ease-in-out',
    'bg-zinc-200 ring-1 ring-black/5 ring-inset dark:bg-white/5 dark:ring-white/15',
    'checked:bg-(--switch-bg) checked:ring-(--switch-bg-ring) dark:checked:bg-(--switch-bg) dark:checked:ring-(--switch-bg-ring)',
    'focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
    'hover:ring-black/15 hover:checked:ring-(--switch-bg-ring)',
    'dark:hover:ring-white/25 dark:hover:checked:ring-(--switch-bg-ring)',
    'disabled:bg-zinc-200 disabled:opacity-50 disabled:checked:bg-zinc-200 disabled:checked:ring-black/5',
    'dark:disabled:bg-white/15 dark:disabled:checked:bg-white/15 dark:disabled:checked:ring-white/15',
    'before:pointer-events-none before:absolute before:top-1/2 before:left-[3px] before:size-4.5 before:-translate-y-1/2 before:rounded-full before:border before:border-transparent before:transition before:duration-200 before:ease-in-out before:content-[\'\'] sm:before:size-3.5',
    'before:bg-white before:shadow-sm before:ring-1 before:ring-black/5',
    'checked:before:translate-x-4 sm:checked:before:translate-x-3',
    'checked:before:bg-(--switch) checked:before:shadow-(--switch-shadow) checked:before:ring-(--switch-ring)',
    'checked:disabled:before:bg-white checked:disabled:before:shadow-sm checked:disabled:before:ring-black/5',
    colors[color]
  )
  if (onChange) input.addEventListener('change', () => onChange(input.checked))

  return input
}
