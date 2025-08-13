import {ActionType, type FreezerAction, reduceFreezerItems} from './freezerItemsReducer'; // Adjust based on file structure
import { type FreezerItem, Unit } from './models';
import {getDate} from "./utils.ts";

describe('reduce Freezer Items tests', () => {
    // Setup mock test data
    const initialItems: FreezerItem[] = [
        {
            id: 1,
            description: 'Chicken',
            type: 'Meat',
            amount: 500,
            unit: Unit.gram,
            frozen: new Date('2023-01-01'),
            expiration: new Date('2024-01-01'),
            created: new Date('2023-01-01'),
            isDeleted: false,
            deletedOn: new Date()
        },
        {
            id: 2,
            description: 'Fish',
            type: 'Seafood',
            amount: 2,
            unit: Unit.pieces,
            frozen: new Date('2023-02-01'),
            expiration: new Date('2024-02-01'),
            created: new Date('2023-02-01'),
            isDeleted: false,
            deletedOn: new Date()
        },
    ];

    it('should add a new item', () => {
        const newItem: FreezerItem = {
            id: 0, // ID will be assigned by the reducer
            description: 'Beef',
            type: 'Meat',
            amount: 300,
            unit: Unit.gram,
            frozen: new Date('2023-03-01'),
            expiration: new Date('2024-03-01'),
            created: new Date('2023-03-01'),
            isDeleted: false,
            deletedOn: new Date()
        };

        const action: FreezerAction = {
            type: ActionType.add,
            item: newItem,
        };

        const result = reduceFreezerItems(initialItems, action);

        expect(result).toHaveLength(3); // New item added
        const addedItem = result.find((item) => item.description === 'Beef');
        expect(addedItem).toBeDefined();
        expect(addedItem!.id).toBe(3); // ID will be the next highest
    });

    it('should mark an item as deleted', () => {
        const action: FreezerAction = {
            type: ActionType.delete,
            id: 1,
            monthsToKeepDeletedItems: 2
        };

        const result = reduceFreezerItems(initialItems, action);

        expect(result).toHaveLength(2); // Length remains unchanged because we're not removing, just marking deleted
        const deletedItem = result.find((item) => item.id === 1);
        expect(deletedItem).toBeDefined();
        expect(deletedItem?.isDeleted).toBe(true);
        expect(deletedItem?.deletedOn).toEqual(getDate(2)); // `deletedOn` is set
    });

    it('should handle deleting a non-existent item gracefully', () => {
        const action: FreezerAction = {
            type: ActionType.delete,
            id: 999, // Invalid ID
            monthsToKeepDeletedItems: 2
        };

        const result = reduceFreezerItems(initialItems, action);

        expect(result).toEqual(initialItems); // State should remain unchanged
    });

    it('should update an existing item', () => {
        const updatedItem: FreezerItem = {
            id: 1,
            description: 'Updated Chicken', // Updated name
            type: 'Meat',
            amount: 550, // Updated amount
            unit: Unit.gram,
            frozen: new Date('2023-01-01'),
            expiration: new Date('2024-01-01'),
            created: new Date('2023-01-01'),
            isDeleted: false,
            deletedOn: new Date()
        };

        const action: FreezerAction = {
            type: ActionType.update,
            item: updatedItem,
        };

        const result = reduceFreezerItems(initialItems, action);

        expect(result).toHaveLength(2); // No new items added
        const expected = result.find((item) => item.id === updatedItem.id);
        expect(expected).toEqual(updatedItem); // The item should be updated
    });

    it('should load a new set of items', () => {
        const newItems: FreezerItem[] = [
            {
                id: 3,
                description: 'New Item',
                type: 'Other',
                amount: 1,
                unit: Unit.portions,
                frozen: new Date('2023-04-01'),
                expiration: new Date('2024-04-01'),
                created: new Date('2023-04-01'),
                isDeleted: false,
                deletedOn: new Date()
            },
        ];

        const action: FreezerAction = {
            type: ActionType.replace,
            items: newItems,
        };

        const result = reduceFreezerItems(initialItems, action);

        expect(result).toEqual(newItems); // New items should entirely replace the old
    });
});