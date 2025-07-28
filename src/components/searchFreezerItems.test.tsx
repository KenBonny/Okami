import {type FreezerItem, Unit} from './models';
import {filter} from "./searchFreezerItems.tsx";

describe('SearchFreezerItems filter', () => {
    // Test data
    const testItems: FreezerItem[] = [
        {
            id: 1,
            name: "Chicken Breast",
            type: "Meat",
            amount: 500,
            unit: Unit.gram,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: false
        },
        {
            id: 2,
            name: "Beef Steak",
            type: "Meat",
            amount: 300,
            unit: Unit.gram,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: true
        },
        {
            id: 3,
            name: "Fish",
            type: "Seafood",
            amount: 2,
            unit: Unit.pieces,
            frozen: new Date(),
            expiration: new Date(),
            created: new Date(),
            isDeleted: false
        }
    ];

    // Test cases
    it('should filter items by name case insensitive', () => {
        const result = filter(testItems, "chicken", false);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Chicken Breast");
    });

    it('should filter items by unit', () => {
        const result = filter(testItems, "pieces", false);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Fish");
    });

    it('should exclude deleted items when includeDeleted is false', () => {
        const result = filter(testItems, "", false);
        expect(result).toHaveLength(2);
        expect(result.some(item => item.isDeleted)).toBeFalsy();
    });

    it('should include deleted items when includeDeleted is true', () => {
        const result = filter(testItems, "", true);
        expect(result).toHaveLength(3);
        expect(result.some(item => item.isDeleted)).toBeTruthy();
    });

    it('should return empty array when no matches found', () => {
        const result = filter(testItems, "xyz", false);
        expect(result).toHaveLength(0);
    });

    it('should handle empty search terms', () => {
        const result = filter(testItems, "", false);
        expect(result).toHaveLength(2); // Only non-deleted items
    });

    it('should handle case variations in search terms', () => {
        const variations = [
            "CHICKEN",
            "chicken",
            "ChIcKeN",
            "PIECES",
            "pieces",
            "PiEcEs"
        ];

        variations.forEach(term => {
            const result = filter(testItems, term, false);
            expect(result.length).toBeGreaterThan(0);
        });
    });
});