import clsx from 'clsx'
import { createInput, createInputGroup } from './input.ts'

export interface AutoCompleteOptions {
  items: string[]
  value: string
  placeholder?: string
  className?: string
  onChange: (value: string) => void
}

export interface AutoCompleteHandle {
  root: HTMLDivElement
  setItems: (items: string[]) => void
  getValue: () => string
}

export function createAutoCompleteInput(options: AutoCompleteOptions): AutoCompleteHandle {
  const { value, placeholder = 'Type to select an option...', className, onChange } = options

  let items = options.items
  let text = value
  let activeIndex = -1
  let open = false

  const root = document.createElement('div')
  root.className = clsx('relative', className)

  const { root: inputRoot, input } = createInput({ type: 'text', value: text, placeholder, className: 'basis-11/12' })
  const group = createInputGroup([inputRoot])

  const listId = `autocomplete-list-${Math.random().toString(36).slice(2)}`
  const list = document.createElement('ul')
  list.id = listId
  list.setAttribute('role', 'listbox')
  list.className =
    'absolute z-10 w-full bg-white border border-amber-400 rounded-md shadow-md mt-1 max-h-48 overflow-auto'
  list.hidden = true

  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-expanded', 'false')
  input.setAttribute('aria-autocomplete', 'list')
  input.setAttribute('aria-controls', listId)

  function filtered(): string[] {
    return text ? items.filter((item) => item.toLowerCase().includes(text.toLowerCase())) : items
  }

  function renderList() {
    list.innerHTML = ''
    list.hidden = !open
    if (!open) return

    const available = filtered()
    if (available.length === 0) {
      const li = document.createElement('li')
      li.className = 'px-3 py-2'
      li.textContent = 'No suggestions'
      list.append(li)
      input.removeAttribute('aria-activedescendant')
      return
    }

    available.forEach((suggestion, index) => {
      const li = document.createElement('li')
      li.id = `${listId}-option-${index}`
      li.setAttribute('role', 'option')
      li.setAttribute('aria-selected', String(index === activeIndex))
      li.className = clsx('px-3 py-2 cursor-pointer hover:bg-amber-100', index === activeIndex && 'bg-amber-100')
      li.textContent = suggestion
      li.addEventListener('mousedown', (event) => {
        event.preventDefault()
        select(suggestion)
      })
      list.append(li)
    })

    if (activeIndex >= 0) input.setAttribute('aria-activedescendant', `${listId}-option-${activeIndex}`)
    else input.removeAttribute('aria-activedescendant')
  }

  function select(suggestion: string) {
    text = suggestion
    input.value = text
    onChange(text)
    setOpen(false)
  }

  function setOpen(next: boolean) {
    open = next
    activeIndex = -1
    input.setAttribute('aria-expanded', String(open))
    renderList()
  }

  input.addEventListener('input', () => {
    text = input.value
    onChange(text)
    activeIndex = -1
    setOpen(true)
  })

  input.addEventListener('focus', () => setOpen(true))
  input.addEventListener('blur', () => setOpen(false))

  input.addEventListener('keydown', (event) => {
    const available = filtered()
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) { setOpen(true); return }
      activeIndex = available.length ? (activeIndex + 1) % available.length : -1
      renderList()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) { setOpen(true); return }
      activeIndex = available.length ? (activeIndex - 1 + available.length) % available.length : -1
      renderList()
    } else if (event.key === 'Enter') {
      if (open && activeIndex >= 0 && available[activeIndex]) {
        event.preventDefault()
        select(available[activeIndex])
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  })

  root.append(group, list)
  return {
    root,
    setItems(newItems: string[]) {
      items = newItems
      if (open) renderList()
    },
    getValue() {
      return text
    },
  }
}
