import type {FreezerItem} from "./models.ts";

export enum FreezerField {
    description = "description",
    type = "type",
    unit = "unit",
    frozen = "frozen",
    expiration = "expiration"
}

export enum ActionTypes {
    update = "update",
    sort = "sort"
}

export enum SortDirection {
    ascending = "ascending",
    descending = "descending"
}

export function updateAllItems(items: FreezerItem[]){
    return { type: ActionTypes.update, items } as const;
}

export function sortItems(field: FreezerField) {
    return { type: ActionTypes.sort, field } as const;
}

export type SortType = ReturnType<typeof updateAllItems | typeof sortItems>;

export interface SortedFreezerItems {
    readonly items: FreezerItem[];
    readonly field: FreezerField;
    readonly direction: SortDirection;
}

export const initialSortFreezerItemsState : SortedFreezerItems = {
    items: [],
    field: FreezerField.description,
    direction: SortDirection.ascending,
}

export function sortFreezerItemsReducer(sortData: SortedFreezerItems, action: SortType) : SortedFreezerItems {
    let {items, field, direction} = sortData;
    switch (action.type) {
        case ActionTypes.update:
            items = action.items;
            break;
        case ActionTypes.sort:
            const differentField = field !== action.field;
            const isAscending = direction === SortDirection.ascending;
            direction = differentField
                ? SortDirection.ascending
                : isAscending
                    ? SortDirection.descending
                    : SortDirection.ascending;
            field = action.field;
            break;
    }

    let sortedItems: FreezerItem[] = [];
    switch (field) {
        case FreezerField.description:
            sortedItems = items.sort(
                sort(direction, (left: FreezerItem, right: FreezerItem) => left.description.localeCompare(right.description)));
            break;
        case FreezerField.type:
            sortedItems = items.sort(
                sort(direction, (left: FreezerItem, right: FreezerItem) => left.type.localeCompare(right.type)));
            break;
        case FreezerField.unit:
            sortedItems = items.sort(
                sort(direction, (left: FreezerItem, right: FreezerItem) => {
                    const unitComparison = left.unit - right.unit;
                    if (unitComparison !== 0) return unitComparison;
                    else return left.amount - right.amount;
                }));
            break;
        case FreezerField.frozen:
            sortedItems = items.sort(
                sort(direction, (left: FreezerItem, right: FreezerItem) => left.frozen.getTime() - right.frozen.getTime()));
            break;
        case FreezerField.expiration:
            sortedItems = items.sort(
                sort(direction, (left: FreezerItem, right: FreezerItem) => left.expiration.getTime() - right.expiration.getTime()));
            break;
    }

    return {
        items: sortedItems,
        field,
        direction
    }
}

function sort(direction: SortDirection, sorter: (left: FreezerItem, right: FreezerItem) => number)
    : (left: FreezerItem, right: FreezerItem) => number {
    return direction === SortDirection.ascending
        ? (left: FreezerItem, right: FreezerItem) => sorter(left, right)
        : (left: FreezerItem, right: FreezerItem) => sorter(right, left);
}