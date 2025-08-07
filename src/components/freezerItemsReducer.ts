import type {FreezerItem} from "./models.ts";
import {getDate} from "./utils.ts";

export enum ActionType {
    add = "add",
    delete = "delete",
    update = "update",
    replace = "replace"
}

export function addFreezerItem(item: FreezerItem) {
    return {type: ActionType.add, item} as const;
}

export function deleteFreezerItem(id: number, monthsToKeepDeletedItems: number) {
    return {type: ActionType.delete, id, monthsToKeepDeletedItems} as const;
}

export function updateFreezerItem(item: FreezerItem) {
    return {type: ActionType.update, item} as const;
}

export function replaceFreezerItems(items: FreezerItem[]) {
    return {type: ActionType.replace, items} as const;
}

export type FreezerAction = ReturnType<
    typeof addFreezerItem
    | typeof deleteFreezerItem
    | typeof updateFreezerItem
    | typeof replaceFreezerItems>;

export function reduceFreezerItems(items: FreezerItem[], action: FreezerAction) : FreezerItem[] {
    switch (action.type) {
        case ActionType.add:
            const ids = items.map(item => item.id);
            const nextId = Math.max(...ids, 0) + 1;
            return [...items, {...action.item, id: nextId}];

        case ActionType.delete:
            const deleted = items.find(i => i.id === action.id);
            if (!deleted || deleted.isDeleted) return items;

            return [...(items.filter(item => item !== deleted)), {
                ...deleted,
                isDeleted: true,
                deletedOn: getDate(action.monthsToKeepDeletedItems)
            }];

        case ActionType.update:
            return items.map(item =>
                item.id === action.item.id ? action.item : item
            );

        case ActionType.replace:
            return action.items;
    }
}