import type {TokenResponse} from "@react-oauth/google";

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

export interface FreezerItem {
    id: number;
    name: string;
    type: string;
    amount: number;
    unit: Unit;
    frozen: Date;
    expiration: Date;
    created: Date;
    isDeleted: boolean;
    deletedOn?: Date;
}

export interface User{
    firstname: string;
    lastname: string;
    name: string;
    image: string | null;
    tokenAcquired: Date;
    token: TokenResponse;
}

// for more scopes: https://developers.google.com/identity/protocols/oauth2/scopes
export class GoogleScopes {
    static readonly driveFilesForApp : string = "https://www.googleapis.com/auth/drive.file";
    static readonly userProfile: string = "profile"; // https://www.googleapis.com/auth/userinfo.profile
    static readonly userEmail: string = "email"; // https://www.googleapis.com/auth/userinfo.email
}