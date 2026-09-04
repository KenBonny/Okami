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
})
