import {type FreezerItem, Unit} from './models';
import {filter} from "./searchFreezerItems.tsx";

describe('SearchFreezerItems filter', () => {
    const chickenBreast = "Chicken Breast";
    const beefSteak = "Beef Steak";
    const fish = "Fish";
    const sausages = "Sausages";
    // Test data
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
            isDeleted: false,
            deletedOn: new Date()
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
            isDeleted: false,
            deletedOn: new Date()
        }
    ];

    // Test cases
    it('should filter items by name case insensitive', () => {
        const result = filter(testItems, "chicken", false);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(chickenBreast);
    });

    it('should filter items by unit', () => {
        const result = filter(testItems, "pieces", false);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(fish);
    });

    it('should exclude deleted items when includeDeleted is false', () => {
        const result = filter(testItems, "", false);
        expect(result).toHaveLength(3);
        expect(result.some(item => item.isDeleted)).toBeFalsy();
    });

    it('should include deleted items when includeDeleted is true', () => {
        const result = filter(testItems, "", true);
        expect(result).toHaveLength(4);
        expect(result.some(item => item.isDeleted)).toBeTruthy();
    });

    it('should return empty array when no matches found', () => {
        const result = filter(testItems, "xyz", false);
        expect(result).toHaveLength(0);
    });

    it('should filter on the type', () => {
        const result = filter(testItems, "seafood", false);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(fish);
    })

    it('should handle empty search terms', () => {
        const result = filter(testItems, "", false);
        expect(result).toHaveLength(3); // Only non-deleted items
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

    it('should handle multiple search terms', () => {
        const variations = [
            {term: "chick gram", expected: [chickenBreast]},
            {term: "breast gram", expected: [chickenBreast]},
            {term: "fish pieces", expected: [fish]},
            {term: "pieces", expected: [fish]},
            {term: "beef gram", expected: []},
            {term: "fish piec", expected: []},
            {term: "SeaFood", expected: [fish]},
            {term: "meat gram", expected: [chickenBreast, sausages]}
        ]

        variations.forEach(variation => {
            const result = filter(testItems, variation.term, false);
            expect(result).toHaveLength(variation.expected.length);
            expect(variation.expected.every(expectedName =>
                result.some(r => r.name === expectedName))).toBeTruthy();
        });

    })
});