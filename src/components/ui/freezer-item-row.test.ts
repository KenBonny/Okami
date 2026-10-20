import {createFreezerItemRow} from './freezer-item-row.ts'
import {Unit, type FreezerItem} from '../Models.ts'

function makeItem(overrides: Partial<FreezerItem> = {}): FreezerItem {
    return {
        id: 1,
        description: 'Peas',
        type: 'Vegetable',
        notes: '',
        amount: 500,
        unit: Unit.gram,
        frozen: new Date('2026-01-01'),
        expiration: new Date('2027-01-01'),
        created: new Date('2026-01-01'),
        isDeleted: false,
        deletedOn: new Date('2026-01-01'),
        ...overrides,
    }
}

describe('createFreezerItemRow', () => {
    it('renders view mode with item details', () => {
        const {root} = createFreezerItemRow({item: makeItem(), onDelete: jest.fn(), onSave: jest.fn()})
        expect(root.textContent).toContain('Peas')
        expect(root.textContent).toContain('Vegetable')
        expect(root.querySelectorAll('button')).toHaveLength(2)
    })

    it('switches to edit mode and back on edit button click', () => {
        const {root} = createFreezerItemRow({item: makeItem(), onDelete: jest.fn(), onSave: jest.fn()})
        const editButton = root.querySelector('button')!
        editButton.click()

        expect(root.querySelector('input#description')).not.toBeNull()

        editButton.click()
        expect(root.querySelector('input#description')).toBeNull()
    })

    it('saves edited fields and calls onSave', () => {
        const onSave = jest.fn()
        const item = makeItem()
        const {root} = createFreezerItemRow({item, onDelete: jest.fn(), onSave})
        root.querySelector('button')!.click()

        const descriptionInput = root.querySelector<HTMLInputElement>('input#description')!
        descriptionInput.value = 'Carrots'
        descriptionInput.dispatchEvent(new Event('input'))

        const saveButton = root.querySelector('button')!
        saveButton.click()

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({description: 'Carrots'}))
        expect(root.querySelector('input#description')).toBeNull()
    })

    it('calls onDelete with the item id', () => {
        const onDelete = jest.fn()
        const {root} = createFreezerItemRow({item: makeItem({id: 42}), onDelete, onSave: jest.fn()})
        const deleteButton = root.querySelectorAll('button')[1]
        deleteButton.click()
        expect(onDelete).toHaveBeenCalledWith(42)
    })

    it('update() replaces the displayed item and resets edit state', () => {
        const {root, update} = createFreezerItemRow({item: makeItem(), onDelete: jest.fn(), onSave: jest.fn()})
        root.querySelector('button')!.click()
        update(makeItem({description: 'Sprouts'}))
        expect(root.textContent).toContain('Sprouts')
        expect(root.querySelector('input#description')).toBeNull()
    })

    describe('expiration severity', () => {
        const expired = () => makeItem({expiration: new Date('2000-01-01')})
        const fine = () => makeItem({expiration: new Date('2999-01-01')})

        it('puts the severity classes on data cells and not on the row or action cells', () => {
            const {root} = createFreezerItemRow({item: expired(), onDelete: jest.fn(), onSave: jest.fn()})
            const cells = Array.from(root.children)

            expect(root.className).toBe('')
            expect(cells[0].classList.contains('expired')).toBe(false)
            expect(cells[6].classList.contains('expired')).toBe(false)
            cells.slice(1, 6).forEach(cell => expect(cell.classList.contains('expired')).toBe(true))
        })

        it('puts the accent bar on the first data cell only', () => {
            const {root} = createFreezerItemRow({item: expired(), onDelete: jest.fn(), onSave: jest.fn()})
            const cells = Array.from(root.children)

            expect(cells[1].classList.contains('expired-bar')).toBe(true)
            cells.filter((_, i) => i !== 1).forEach(cell => expect(cell.classList.contains('expired-bar')).toBe(false))
        })

        it('keeps action cells unstyled in edit mode', () => {
            const {root} = createFreezerItemRow({item: expired(), onDelete: jest.fn(), onSave: jest.fn()})
            root.querySelector('button')!.click()
            const cells = Array.from(root.children)

            expect(cells[0].classList.contains('expired')).toBe(false)
            expect(cells[6].classList.contains('expired')).toBe(false)
            cells.slice(1, 6).forEach(cell => expect(cell.classList.contains('expired')).toBe(true))
        })

        it('shows no severity classes for an item without warning', () => {
            const {root} = createFreezerItemRow({item: fine(), onDelete: jest.fn(), onSave: jest.fn()})
            expect(root.innerHTML).not.toMatch(/-warning|expired/)
        })
    })
})
