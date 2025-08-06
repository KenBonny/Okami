import type {TokenResponse} from "@react-oauth/google";
import {getDate} from "./utils.ts";
import {config} from "../config.ts";

export enum Unit {
    gram = 0,
    pieces = 1,
    portions = 2
}

export function toUnit(value: string | number): Unit | null {
    if (typeof value === "number") {
        return Unit[Unit[value] as keyof typeof Unit];
    } else if (typeof value === "string") {
        const enumKey = value as keyof typeof Unit;
        return Unit[enumKey];
    } else {
        return null;
    }
}

export function defaultFreezerItem() {
    return ({
        id: 0,
        name: "",
        type: "",
        amount: 1,
        unit: Unit.gram,
        frozen: new Date(),
        expiration: getDate(config.defaultExpiration),
        created: new Date(),
        isDeleted: false,
        deletedOn: new Date(),
    });
};

export type FreezerItem = ReturnType<typeof defaultFreezerItem>;

export interface User {
    firstname: string;
    lastname: string;
    name: string;
    image: string | null;
    tokenAcquired: Date;
    token: TokenResponse;
}