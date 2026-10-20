import {createFreezerItemCard} from './freezer-item-card.ts'
import {Unit, type FreezerItem} from '../Models.ts'

function makeItem(overrides: Partial<FreezerItem> = {}): FreezerItem {
    return {
        id: 1,
        description: 'Peas',
        type: 'Vegetable',
        notes: 'From the garden',
        amount: 500,
        unit: Unit.gram,
        frozen: new Date('2026-01-01'),
        expiration: new Date('2999-01-01'),
        created: new Date('2026-01-01'),
        isDeleted: false,
        deletedOn: new Date('2026-01-01'),
        ...overrides,
    }
}

const expired = () => makeItem({expiration: new Date('2000-01-01')})

function create(item = makeItem(), handlers = {onDelete: jest.fn(), onSave: jest.fn()}) {
    return {...createFreezerItemCard({item, ...handlers}), ...handlers}
}

describe('createFreezerItemCard', () => {
    it('renders view mode with item details and edit/delete actions', () => {
        const {root} = create()
        expect(root.textContent).toContain('Peas')
        expect(root.textContent).toContain('From the garden')
        expect(root.textContent).toContain('Vegetable')
        expect(root.textContent).toContain('500 gram')
        expect(root.querySelector('[aria-label="Edit"]')).not.toBeNull()
        expect(root.querySelector('[aria-label="Delete"]')).not.toBeNull()
    })

    it('edits inline and saves', () => {
        const {root, onSave} = create()
        root.querySelector<HTMLButtonElement>('[aria-label="Edit"]')!.click()

        const description = root.querySelector<HTMLInputElement>('input[name="description"]')!
        description.value = 'Carrots'
        description.dispatchEvent(new Event('input'))
        root.querySelector<HTMLButtonElement>('[aria-label="Save"]')!.click()

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({description: 'Carrots'}))
        expect(root.querySelector('input')).toBeNull()
        expect(root.textContent).toContain('Carrots')
    })

    it('discards edits on cancel', () => {
        const {root, onSave} = create()
        root.querySelector<HTMLButtonElement>('[aria-label="Edit"]')!.click()
        const description = root.querySelector<HTMLInputElement>('input[name="description"]')!
        description.value = 'Carrots'
        description.dispatchEvent(new Event('input'))
        root.querySelector<HTMLButtonElement>('[aria-label="Cancel"]')!.click()

        expect(onSave).not.toHaveBeenCalled()
        expect(root.textContent).toContain('Peas')
    })

    it('calls onDelete with the item id', () => {
        const {root, onDelete} = create(makeItem({id: 42}))
        root.querySelector<HTMLButtonElement>('[aria-label="Delete"]')!.click()
        expect(onDelete).toHaveBeenCalledWith(42)
    })

    it('update() replaces the displayed item and resets edit state', () => {
        const {root, update} = create()
        root.querySelector<HTMLButtonElement>('[aria-label="Edit"]')!.click()
        update(makeItem({description: 'Sprouts'}))
        expect(root.textContent).toContain('Sprouts')
        expect(root.querySelector('input')).toBeNull()
    })

    describe('expiration severity', () => {
        it('tints the body and adds the accent bar, leaving the footer neutral', () => {
            const {root} = create(expired())
            const [body, footer] = Array.from(root.children)
            expect(body.classList.contains('expired')).toBe(true)
            expect(body.classList.contains('expired-bar')).toBe(true)
            expect(footer.className).not.toMatch(/expired|-warning/)
            expect(root.className).not.toMatch(/expired|-warning/)
        })

        it('keeps the footer neutral in edit mode', () => {
            const {root} = create(expired())
            root.querySelector<HTMLButtonElement>('[aria-label="Edit"]')!.click()
            const [body, footer] = Array.from(root.children)
            expect(body.classList.contains('expired')).toBe(true)
            expect(footer.className).not.toMatch(/expired|-warning/)
        })

        it('shows no severity classes for an item without warning', () => {
            const {root} = create()
            expect(root.innerHTML).not.toMatch(/-warning|expired/)
        })
    })
})
