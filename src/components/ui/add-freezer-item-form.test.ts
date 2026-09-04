import {createAddFreezerItemForm} from './add-freezer-item-form.ts'
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

describe('createAddFreezerItemForm', () => {
    it('submits the entered item and calls onAddItem', () => {
        const onAddItem = jest.fn()
        const {root} = createAddFreezerItemForm({
            items: [],
            onAddItem,
            defaultExpirationMonths: 6,
        })

        const description = root.querySelector<HTMLInputElement>('#description')!
        description.value = 'Carrots'
        description.dispatchEvent(new Event('input'))

        const amount = root.querySelector<HTMLInputElement>('#amount')!
        amount.value = '250'
        amount.dispatchEvent(new Event('input'))

        root.dispatchEvent(new Event('submit', {cancelable: true}))

        expect(onAddItem).toHaveBeenCalledWith(expect.objectContaining({description: 'Carrots', amount: 250}))
    })

    it('resets the description field after submit', () => {
        const {root} = createAddFreezerItemForm({
            items: [],
            onAddItem: jest.fn(),
            defaultExpirationMonths: 6,
        })

        const description = root.querySelector<HTMLInputElement>('#description')!
        description.value = 'Carrots'
        description.dispatchEvent(new Event('input'))

        root.dispatchEvent(new Event('submit', {cancelable: true}))

        expect(description.value).toBe('')
    })

    it('does not throw when update() is called with new items', () => {
        const {update} = createAddFreezerItemForm({
            items: [],
            onAddItem: jest.fn(),
            defaultExpirationMonths: 6,
        })

        expect(() => update([makeItem()])).not.toThrow()
    })

    it('refreshes the type autocomplete suggestions when items change', () => {
        const {root, update} = createAddFreezerItemForm({
            items: [],
            onAddItem: jest.fn(),
            defaultExpirationMonths: 6,
        })

        update([makeItem({type: 'Fruit'})])

        const typeInput = root.querySelectorAll('input')[1]
        typeInput.dispatchEvent(new Event('focus'))
        const suggestions = root.querySelectorAll('ul [role=option]')
        expect(Array.from(suggestions).some(el => el.textContent === 'Fruit')).toBe(true)
    })
})
