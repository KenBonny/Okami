import {
    ActionTypes,
    FreezerField,
    SortDirection,
    type SortedFreezerItems,
    sortFreezerItemsReducer,
    type SortType
} from './sortFreezerItemsReducer';
import {type FreezerItem, Unit} from './models';

describe('sort Freezer Items Reducer', () => {
    const fish = "Fish";
    const beef = "Beef";
    const chicken = "Chicken";
    const testItems: FreezerItem[] = [
        {
            id: 1,
            description: fish,
            type: 'Seafood',
            amount: 300,
            unit: Unit.pieces,
            frozen: new Date('2023-06-10'),
            expiration: new Date('2024-05-01'),
            created: new Date('2023-01-01'),
            isDeleted: false,
            deletedOn: new Date()
        },
        {
            id: 2,
            description: beef,
            type: 'Meat',
            amount: 400,
            unit: Unit.gram,
            frozen: new Date('2023-06-05'),
            expiration: new Date('2024-07-01'),
            created: new Date('2023-01-01'),
            isDeleted: false,
            deletedOn: new Date()
        },
        {
            id: 3,
            description: chicken,
            type: 'Meat',
            amount: 300,
            unit: Unit.gram,
            frozen: new Date('2023-07-01'),
            expiration: new Date('2024-06-01'),
            created: new Date('2023-01-01'),
            isDeleted: false,
            deletedOn: new Date()
        },
    ];

    function expectOrder(items: FreezerItem[], expected: string[]) {
        expect(items.map((item: FreezerItem) => item.description)).toEqual(expected); // Alphabetical order
    }

    const initialState: SortedFreezerItems = {
        items: testItems,
        field: FreezerField.description,
        direction: SortDirection.ascending,
    }

    it('should update items on ActionTypes.update', () => {
        const action: SortType = { type: ActionTypes.update, items: testItems.filter(item => item.id < 3) };
        const result = sortFreezerItemsReducer(initialState, action);

        expectOrder(result.items, [beef, fish]);
        expect(result.field).toBe(initialState.field);
        expect(result.direction).toBe(initialState.direction);
    });

    it('should sort by type in ascending order on ActionTypes.sort', () => {
        const action: SortType = { type: ActionTypes.sort, field: FreezerField.type };
        const result = sortFreezerItemsReducer(initialState, action);

        expectOrder(result.items, [beef, chicken, fish]);
        expect(result.field).toBe(FreezerField.type);
        expect(result.direction).toBe(SortDirection.ascending);
    });

    it('should sort by unit then by the amount on ActionTypes.sort', () => {
        const action: SortType = { type: ActionTypes.sort, field: FreezerField.unit };
        const result = sortFreezerItemsReducer(initialState, action);

        expectOrder(result.items, [chicken, beef, fish]);
        expect(result.field).toBe(FreezerField.unit);
        expect(result.direction).toBe(SortDirection.ascending);
    })

    it('should sort by name in descending order if toggled', () => {
        const initialSortedState: SortedFreezerItems = {
            ...initialState,
            direction: SortDirection.ascending,
            field: FreezerField.description,
        };
        const action: SortType = { type: ActionTypes.sort, field: FreezerField.description };
        const result = sortFreezerItemsReducer(initialSortedState, action);

        expectOrder(result.items, [fish, chicken, beef]);
        expect(result.field).toBe(FreezerField.description);
        expect(result.direction).toBe(SortDirection.descending);
    });

    it('should sort by expiration date in ascending order', () => {
        const action: SortType = { type: ActionTypes.sort, field: FreezerField.expiration };
        const result = sortFreezerItemsReducer(initialState, action);

        expectOrder(result.items, [fish, chicken, beef]);
        expect(result.field).toBe(FreezerField.expiration);
        expect(result.direction).toBe(SortDirection.ascending);
    });

    it('should toggle sort direction for expiration on subsequent sorts', () => {
        let action: SortType = { type: ActionTypes.sort, field: FreezerField.expiration };
        let result = sortFreezerItemsReducer(initialState, action);

        expect(result.direction).toBe(SortDirection.ascending);

        // Sorting again toggles to descending
        result = sortFreezerItemsReducer(result, action);
        expect(result.direction).toBe(SortDirection.descending);

        expectOrder(result.items, [beef, chicken, fish]);
    });

    it('should sort by frozen date in ascending order', () => {
        const action: SortType = { type: ActionTypes.sort, field: FreezerField.frozen };
        const result = sortFreezerItemsReducer(initialState, action);

        expectOrder(result.items, [beef, fish, chicken]);
        expect(result.field).toBe(FreezerField.frozen);
        expect(result.direction).toBe(SortDirection.ascending);
    });

    it('should toggle sort direction when sorting by frozen date consecutively', () => {
        const firstAction: SortType = { type: ActionTypes.sort, field: FreezerField.frozen };
        const ascendingState = sortFreezerItemsReducer(initialState, firstAction);

        expect(ascendingState.direction).toBe(SortDirection.ascending);

        const descendingState = sortFreezerItemsReducer(ascendingState, firstAction);

        expect(descendingState.direction).toBe(SortDirection.descending);
        expectOrder(descendingState.items, [chicken, fish, beef]);
    });

    it('should reset to ascending when sorting by a different field', () => {
        const sortByFrozen : SortType = { type: ActionTypes.sort, field: FreezerField.frozen };
        const initialSorted = sortFreezerItemsReducer(initialState, sortByFrozen);

        expect(initialSorted.field).toBe(FreezerField.frozen);
        expect(initialSorted.direction).toBe(SortDirection.ascending);

        var descendingResult = sortFreezerItemsReducer(initialSorted, sortByFrozen);
        expect(descendingResult.field).toBe(FreezerField.frozen);
        expect(descendingResult.direction).toBe(SortDirection.descending);

        const action: SortType = { type: ActionTypes.sort, field: FreezerField.type };
        const result = sortFreezerItemsReducer(descendingResult, action);

        expect(result.field).toBe(FreezerField.type);
        expect(result.direction).toBe(SortDirection.ascending); // Resets to ascending for a new field
    });
});