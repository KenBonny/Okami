import {type FreezerItem} from "./Models.ts";

export function removeDeletedItems(items: FreezerItem[]): FreezerItem[] {
    const now = new Date().getTime();
    return items.filter(item => !item.isDeleted || item.deletedOn.getTime() > now);
}
