import {type FreezerItem, Unit} from "./models.ts";
import {removeDeletedItems} from "./freezerManager.tsx";
import {getDate} from "./utils.ts";

describe('remove deleted items', () => {
    const chickenBreast = "Chicken Breast";
    const beefSteak = "Beef Steak";
    const fish = "Fish";
    const sausages = "Sausages";
    const oneSecondAgo = new Date(Date.now() - 1000);
    const testItems: FreezerItem[] = [
        {
            id: 1,
            name: chickenBreast,
            type: "Meat",
            amount: 500,
            unit: Unit.gram,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: false,
            deletedOn: new Date()
        },
        {
            id: 2,
            name: beefSteak,
            type: "Meat",
            amount: 300,
            unit: Unit.gram,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: true,
            deletedOn: new Date()
        },
        {
            id: 3,
            name: fish,
            type: "Seafood",
            amount: 2,
            unit: Unit.pieces,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: true,
            deletedOn: getDate(1)
        },
        {
            id: 4,
            name: sausages,
            type: "Meat",
            amount: 300,
            unit: Unit.gram,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: true,
            deletedOn: oneSecondAgo
        }
    ];

    it('should only keep non-deleted items', () => {
        const result = removeDeletedItems(testItems);
        expect(result.length).toBe(2);
        expect(result.map(item => item.id)).toEqual([1, 3]);
    });
});