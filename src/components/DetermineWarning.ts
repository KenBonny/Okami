import {type WarningConfig} from "../config.ts";

export const WarningText = {
    ok: "",
    first: "first-warning",
    second: "second-warning",
    expired: "expired",
} as const;

type WarningStatus = typeof WarningText[keyof typeof WarningText];

export function determineWarning(expiration: Date, today: Date, config: WarningConfig): WarningStatus {
    if (today >= expiration) return WarningText.expired;

    const secondWarning = new Date(expiration);
    secondWarning.setMonth(secondWarning.getMonth() - config.monthsBeforeSecond);
    if (today >= secondWarning) return WarningText.second;

    const firstWarning = new Date(expiration);
    firstWarning.setMonth(firstWarning.getMonth() - config.monthsBeforeFirst);
    if (today >= firstWarning) return WarningText.first;

    return WarningText.ok;
}
