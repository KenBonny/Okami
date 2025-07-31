export enum Unit {
    gram = 0,
    pieces = 1,
    portions = 2
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

// for more scopes: https://developers.google.com/identity/protocols/oauth2/scopes
export class GoogleScopes {
    static readonly driveFilesForApp : string = "https://www.googleapis.com/auth/drive.file";
    static readonly userProfile: string = "profile"; // https://www.googleapis.com/auth/userinfo.profile
    static readonly userEmail: string = "email"; // https://www.googleapis.com/auth/userinfo.email
}