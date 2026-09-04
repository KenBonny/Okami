import {createFreezerItemRowHeader} from './freezer-item-row-header.ts'
import {FreezerField, SortDirection} from '../SortFreezerItemsReducer.ts'

describe('createFreezerItemRowHeader', () => {
    it('renders the label and an unsorted icon when not the active sort field', () => {
        const {root} = createFreezerItemRowHeader({
            field: FreezerField.type,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            label: 'Type',
            onClick: jest.fn(),
        })

        expect(root.textContent).toContain('Type')
        expect(root.querySelector('svg')!.getAttribute('class')).toContain('text-zinc-300')
    })

    it('highlights the icon when it is the active sort field, ascending', () => {
        const {root} = createFreezerItemRowHeader({
            field: FreezerField.description,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            label: 'Description',
            onClick: jest.fn(),
        })

        expect(root.querySelector('svg')!.getAttribute('class')).toContain('text-amber-400')
    })

    it('updates the icon when sort state changes', () => {
        const {root, update} = createFreezerItemRowHeader({
            field: FreezerField.type,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            label: 'Type',
            onClick: jest.fn(),
        })

        expect(root.querySelector('svg')!.getAttribute('class')).toContain('text-zinc-300')
        update(FreezerField.type, SortDirection.ascending)
        expect(root.querySelector('svg')!.getAttribute('class')).toContain('text-amber-400')
    })

    it('dispatches the field on click', () => {
        const onClick = jest.fn()
        const {root} = createFreezerItemRowHeader({
            field: FreezerField.unit,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            label: 'Amount',
            onClick,
        })

        root.click()
        expect(onClick).toHaveBeenCalledWith(FreezerField.unit)
    })
})
