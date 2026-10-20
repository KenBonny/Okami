import {createItemEditor} from './item-editor.ts'
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

function setup(item = makeItem()) {
    const onDelete = jest.fn()
    const onSave = jest.fn()
    const onChange = jest.fn()
    return {editor: createItemEditor({item, onDelete, onSave, onChange}), onDelete, onSave, onChange}
}

describe('createItemEditor', () => {
    it('toggles edit mode and notifies', () => {
        const {editor, onChange} = setup()
        editor.toggleEdit()
        expect(editor.editing).toBe(true)
        editor.toggleEdit()
        expect(editor.editing).toBe(false)
        expect(onChange).toHaveBeenCalledTimes(2)
    })

    it('discards edits when toggled off', () => {
        const {editor} = setup()
        editor.toggleEdit()
        editor.editedItem.description = 'Carrots'
        editor.toggleEdit()
        expect(editor.editedItem.description).toBe('Peas')
        expect(editor.item.description).toBe('Peas')
    })

    it('saves the edited item and leaves edit mode', () => {
        const {editor, onSave, onChange} = setup()
        editor.toggleEdit()
        editor.editedItem.description = 'Carrots'
        editor.save()
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({description: 'Carrots'}))
        expect(editor.item.description).toBe('Carrots')
        expect(editor.editing).toBe(false)
        expect(onChange).toHaveBeenCalledTimes(2)
    })

    it('calls onDelete with the item id', () => {
        const {editor, onDelete} = setup(makeItem({id: 42}))
        editor.remove()
        expect(onDelete).toHaveBeenCalledWith(42)
    })

    it('replace swaps the item and resets edit state', () => {
        const {editor, onChange} = setup()
        editor.toggleEdit()
        editor.replace(makeItem({description: 'Sprouts'}))
        expect(editor.item.description).toBe('Sprouts')
        expect(editor.editing).toBe(false)
        expect(onChange).toHaveBeenCalledTimes(2)
    })
})
