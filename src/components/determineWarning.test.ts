import {determineWarning, WarningText} from "./freezerItemRow.tsx";
import {type WarningConfig} from "../config.ts"; // Adjust the import path

describe("determineWarning", () => {
    const warnings : WarningConfig = {
        monthsBeforeFirst: 3,
        monthsBeforeSecond: 1
    }
    it("should return 'Expired' if the expiration date is in the past", () => {
        const today = new Date("2025-08-10");
        const expirationDate = new Date("2025-07-01");

        const result = determineWarning(expirationDate, today, warnings);

        expect(result).toBe(WarningText.expired);
    });

    it("should return 'Second Warning' if the expiration date is within the second warning period", () => {
        const today = new Date("2025-08-10");
        const expirationDate = new Date("2025-09-09"); // Less than or equal to 1 month away

        const result = determineWarning(expirationDate, today, warnings);

        expect(result).toBe(WarningText.second);
    });

    it("should return 'First Warning' if the expiration date is within the first warning period but not the second", () => {
        const today = new Date("2025-08-10");
        const expirationDate = new Date("2025-11-01"); // Between 1 and 3 months away

        const result = determineWarning(expirationDate, today, warnings);

        expect(result).toBe(WarningText.first);
    });

    it("should return empty if the expiration date is beyond the first warning period", () => {
        const today = new Date("2025-08-10");
        const expirationDate = new Date("2026-02-01"); // More than 3 months away

        const result = determineWarning(expirationDate, today, warnings);

        expect(result).toBe(WarningText.ok);
    });

    it("should return 'Expired' if the expiration date is today", () => {
        const today = new Date("2025-08-10");
        const expirationDate = new Date("2025-08-10");

        const result = determineWarning(expirationDate, today, warnings);

        expect(result).toBe(WarningText.expired);
    });
});