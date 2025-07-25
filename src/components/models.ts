export enum Unit {
    gram = 0,
    pieces = 1,
    portions = 2
}

export interface FreezerItem {
    name: string;
    type: string;
    amount: number;
    unit: Unit;
    frozen: Date;
    expiration: Date;
    created: Date;
}