import clsx from 'clsx'

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week']

export interface InputOptions {
  id?: string
  name?: string
  type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | (typeof dateTypes)[number]
  placeholder?: string
  value?: string | number
  className?: string
  required?: boolean
  min?: string | number
  onInput?: (event: Event) => void
}

export interface InputHandle {
  root: HTMLSpanElement
  input: HTMLInputElement
}

export function createInput(options: InputOptions): InputHandle {
  const { id, name, type = 'text', placeholder, value, className, required, min, onInput } = options

  const root = document.createElement('span')
  root.dataset.slot = 'control'
  root.className = clsx(
    className,
    'relative block w-full',
    'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
    'dark:before:hidden',
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-amber-400',
    'has-[:disabled]:opacity-50 has-[:disabled]:before:bg-zinc-950/5 has-[:disabled]:before:shadow-none',
    'has-[:invalid]:before:shadow-red-500/10'
  )

  const input = document.createElement('input')
  input.type = type
  if (id) input.id = id
  if (name) input.name = name
  if (placeholder) input.placeholder = placeholder
  if (value !== undefined) input.value = String(value)
  if (required) input.required = true
  if (min !== undefined) input.min = String(min)
  input.className = clsx(
    dateTypes.includes(type) && [
      '[&::-webkit-datetime-edit-fields-wrapper]:p-0',
      '[&::-webkit-date-and-time-value]:min-h-[1.5em]',
      '[&::-webkit-datetime-edit]:inline-flex',
      '[&::-webkit-datetime-edit]:p-0',
      '[&::-webkit-datetime-edit-year-field]:p-0',
      '[&::-webkit-datetime-edit-month-field]:p-0',
      '[&::-webkit-datetime-edit-day-field]:p-0',
    ],
    'relative block w-full appearance-none rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
    'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
    'border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20',
    'bg-transparent dark:bg-white/5',
    'focus:outline-hidden',
    'invalid:border-red-500 invalid:hover:border-red-500 dark:invalid:border-red-500 dark:invalid:hover:border-red-500',
    'disabled:border-zinc-950/20 dark:disabled:border-white/15 dark:disabled:bg-white/2.5 dark:hover:disabled:border-white/15',
    'dark:scheme-dark'
  )
  if (onInput) input.addEventListener('input', onInput)

  root.append(input)
  return { root, input }
}

export function createInputGroup(children: Node[]): HTMLSpanElement {
  const group = document.createElement('span')
  group.dataset.slot = 'control'
  group.className = clsx(
    'relative isolate block flex flex-row',
    'has-[[data-slot=icon]:first-child]:[&_input]:pl-10 has-[[data-slot=icon]:last-child]:[&_input]:pr-10 sm:has-[[data-slot=icon]:first-child]:[&_input]:pl-8 sm:has-[[data-slot=icon]:last-child]:[&_input]:pr-8',
    '*:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-3 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:top-2.5 sm:*:data-[slot=icon]:size-4',
    '[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5',
    '*:data-[slot=icon]:text-zinc-500 dark:*:data-[slot=icon]:text-zinc-400'
  )
  group.append(...children)
  return group
}
