import { createButton } from './button.ts'
import { createInput, createInputGroup } from './input.ts'
import { createField, createFieldset, createLabel } from './fieldset.ts'
import { createSwitch, createSwitchField } from './switch.ts'
import { createTable, createTableBody, createTableCell, createTableHead, createTableHeader, createTableRow } from './table.ts'
import { createAutoCompleteInput } from './autocomplete-input.ts'

describe('createButton', () => {
  it('renders a button with the touch target and given children', () => {
    const button = createButton({ color: 'amber', type: 'submit' }, ['Add'])
    expect(button.tagName).toBe('BUTTON')
    expect(button.type).toBe('submit')
    expect(button.textContent).toBe('Add')
    expect(button.className).toContain('--btn-bg:var(--color-amber-400)')
  })

  it('disables the button and wires up click handling', () => {
    const onClick = jest.fn()
    const button = createButton({ plain: true, disabled: true, onClick }, ['Sign out'])
    expect(button.disabled).toBe(true)
    button.disabled = false
    button.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('createInput / createInputGroup', () => {
  it('creates an input wrapped in a control root', () => {
    const { root, input } = createInput({ id: 'description', name: 'description', value: 'Peas', required: true })
    expect(root.dataset.slot).toBe('control')
    expect(input.id).toBe('description')
    expect(input.value).toBe('Peas')
    expect(input.required).toBe(true)
  })

  it('groups children under a single control wrapper', () => {
    const { root } = createInput({ placeholder: 'Search' })
    const group = createInputGroup([root])
    expect(group.dataset.slot).toBe('control')
    expect(group.contains(root)).toBe(true)
  })
})

describe('createFieldset / createField / createLabel', () => {
  it('builds nested fieldset structure with a label', () => {
    const label = createLabel('Include deleted')
    const field = createField(undefined, [label])
    const fieldset = createFieldset('flex', [field])
    expect(fieldset.tagName).toBe('FIELDSET')
    expect(fieldset.className).toContain('flex')
    expect(field.contains(label)).toBe(true)
    expect(label.textContent).toBe('Include deleted')
    expect(label.dataset.slot).toBe('label')
  })
})

describe('createSwitch / createSwitchField', () => {
  it('renders a checkbox styled as a switch and reports changes', () => {
    const onChange = jest.fn()
    const input = createSwitch({ name: 'includeDeleted', onChange })
    expect(input.type).toBe('checkbox')
    expect(input.getAttribute('role')).toBe('switch')

    input.checked = true
    input.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('wraps a label and switch in a field', () => {
    const label = createLabel('Include deleted')
    const input = createSwitch({})
    const field = createSwitchField('shrink-0', [label, input])
    expect(field.dataset.slot).toBe('field')
    expect(field.contains(label)).toBe(true)
    expect(field.contains(input)).toBe(true)
  })
})

describe('table factories', () => {
  it('assembles a table from head/body/row/cell parts', () => {
    const header = createTableHeader(undefined, [document.createTextNode('Description')])
    const headRow = createTableRow(undefined, [header])
    const head = createTableHead([headRow])

    const cell = createTableCell(undefined, [document.createTextNode('Peas')])
    const bodyRow = createTableRow('warning', [cell])
    const body = createTableBody([bodyRow])

    const table = createTable('p-3', [head, body])
    const tableEl = table.querySelector('table')
    expect(tableEl).not.toBeNull()
    expect(tableEl!.contains(header)).toBe(true)
    expect(tableEl!.contains(cell)).toBe(true)
    expect(bodyRow.className).toBe('warning')
  })
})

describe('createAutoCompleteInput', () => {
  it('filters suggestions as the user types and reports the raw value', () => {
    const onChange = jest.fn()
    const { root } = createAutoCompleteInput({ items: ['Peas', 'Pears', 'Carrots'], value: '', onChange })
    const input = root.querySelector('input')!
    const list = root.querySelector('ul')!

    input.dispatchEvent(new Event('focus'))
    expect(list.hidden).toBe(false)
    expect(list.querySelectorAll('[role=option]')).toHaveLength(3)

    input.value = 'carr'
    input.dispatchEvent(new Event('input'))
    expect(onChange).toHaveBeenCalledWith('carr')
    expect(list.querySelectorAll('[role=option]')).toHaveLength(1)
  })

  it('selects a suggestion on Enter and closes the list', () => {
    const onChange = jest.fn()
    const { root } = createAutoCompleteInput({ items: ['Peas', 'Pears'], value: '', onChange })
    const input = root.querySelector('input')!
    const list = root.querySelector('ul')!

    input.dispatchEvent(new Event('focus'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(onChange).toHaveBeenLastCalledWith('Peas')
    expect(list.hidden).toBe(true)
  })

  it('closes the list on Escape without changing the value', () => {
    const onChange = jest.fn()
    const { root } = createAutoCompleteInput({ items: ['Peas', 'Pears'], value: '', onChange })
    const input = root.querySelector('input')!
    const list = root.querySelector('ul')!

    input.dispatchEvent(new Event('focus'))
    expect(list.hidden).toBe(false)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(list.hidden).toBe(true)
  })
})
