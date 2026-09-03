import clsx from 'clsx'

export function createFieldset(className: string | undefined, children: Node[]): HTMLFieldSetElement {
  const fieldset = document.createElement('fieldset')
  fieldset.className = clsx(className, '*:data-[slot=text]:mt-1 [&>*+[data-slot=control]]:mt-6')
  fieldset.append(...children)
  return fieldset
}

export function createField(className: string | undefined, children: Node[]): HTMLDivElement {
  const field = document.createElement('div')
  field.className = clsx(
    className,
    '[&>[data-slot=label]+[data-slot=control]]:mt-3',
    '[&>[data-slot=label]+[data-slot=description]]:mt-1',
    '[&>[data-slot=description]+[data-slot=control]]:mt-3',
    '[&>[data-slot=control]+[data-slot=description]]:mt-3',
    '[&>[data-slot=control]+[data-slot=error]]:mt-3',
    '*:data-[slot=label]:font-medium'
  )
  field.append(...children)
  return field
}

export function createLabel(text: string, options: { className?: string; htmlFor?: string } = {}): HTMLLabelElement {
  const label = document.createElement('label')
  label.dataset.slot = 'label'
  label.className = clsx(options.className, 'text-base/6 text-zinc-950 select-none sm:text-sm/6 dark:text-white')
  label.textContent = text
  if (options.htmlFor) label.htmlFor = options.htmlFor
  return label
}
