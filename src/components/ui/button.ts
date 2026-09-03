import clsx from 'clsx'

const base = [
  'relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
  'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
  'focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
  'disabled:opacity-50',
]

const solid = [
  'border-transparent bg-(--btn-border)',
  'dark:bg-(--btn-bg)',
  'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--radius-lg)-1px)] before:bg-(--btn-bg)',
  'before:shadow-sm',
  'dark:before:hidden',
  'dark:border-white/5',
  'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(var(--radius-lg)-1px)]',
  'after:shadow-[inset_0_1px_--theme(--color-white/15%)]',
  'active:after:bg-(--btn-hover-overlay) hover:after:bg-(--btn-hover-overlay)',
  'dark:after:-inset-px dark:after:rounded-lg',
  'disabled:before:shadow-none disabled:after:shadow-none',
  'cursor-default',
]

const outline = [
  'border-zinc-950/10 text-zinc-950 active:bg-zinc-950/2.5 hover:bg-zinc-950/2.5',
  'dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:active:bg-white/5 dark:hover:bg-white/5',
  'cursor-default',
]

const plain = [
  'border-transparent text-zinc-950 active:bg-zinc-950/5 hover:bg-zinc-950/5',
  'dark:text-white dark:active:bg-white/10 dark:hover:bg-white/10',
  'cursor-default',
]

const colors = {
  'dark/zinc': [
    'text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10',
    'dark:text-white dark:[--btn-bg:var(--color-zinc-600)] dark:[--btn-hover-overlay:var(--color-white)]/5',
  ],
  amber: [
    'text-amber-950 [--btn-hover-overlay:var(--color-white)]/25 [--btn-bg:var(--color-amber-400)] [--btn-border:var(--color-amber-500)]/80',
  ],
}

type Color = keyof typeof colors

export interface ButtonOptions {
  color?: Color
  outline?: boolean
  plain?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
}

export function createButton(options: ButtonOptions, children: (Node | string)[]): HTMLButtonElement {
  const { color, outline: isOutline, plain: isPlain, className, type = 'button', disabled, onClick } = options

  const button = document.createElement('button')
  button.type = type
  button.className = clsx(
    className,
    base,
    isOutline ? outline : isPlain ? plain : clsx(solid, colors[color ?? 'dark/zinc'])
  )
  if (disabled) button.disabled = true
  if (onClick) button.addEventListener('click', onClick)

  const touchTarget = document.createElement('span')
  touchTarget.setAttribute('aria-hidden', 'true')
  touchTarget.className =
    'absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden'
  button.append(touchTarget, ...children)

  return button
}
