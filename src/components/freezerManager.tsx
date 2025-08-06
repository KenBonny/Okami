import {AddFreezerItemForm} from "./addFreezerItemForm.tsx";
import React, {useEffect, useReducer, useState} from "react";
import {type FreezerItem, type User} from "./models.ts";
import {SearchFreezerItems} from "./searchFreezerItems.tsx";
import FreezerItemRow from "./freezerItemRow.tsx";
import GoogleAuth from "./GoogleAuth.tsx";
import {loadFreezerItemsFromGoogle, writeFreezerItemsToGoogleDrive} from "../google/drive.ts";
import {getDate} from "./utils.ts";
import {config} from "../config.ts";

export const FreezerManager: React.FC = () => {
    const [freezerItems, dispatchFreezer] = useReducer(reduceFreezerItems, []);
    const [filteredItems, setFilteredItems] = useState<FreezerItem[]>([]);
    const [user, setUser] = React.useState<User | null>(null);

    useEffect(() => {
        if (user === null) return;

        console.log("save freezer items to Google Drive");
        writeFreezerItemsToGoogleDrive(user, freezerItems)
            .then(_ => console.log("freezer items saved to Google Drive"))
            .catch(console.error);
    }, [freezerItems]);

    const handleAddItem = (newItem: FreezerItem) => {
        dispatchFreezer(addFreezerItem(newItem));
    };

    function handleDelete(id: number) {
        dispatchFreezer(deleteFreezerItem(id, config.monthsToKeepDeletedItems));
    }

    function handleSave(updatedItem: FreezerItem) {
        dispatchFreezer(updateFreezerItem(updatedItem));
    }

    const sortedItems = [...filteredItems].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    async function loadFreezerItems(user: User) {
        setUser(user);
        console.log(`Loading Freezer items for: ${user.name}`);
        const newFreezerItems: FreezerItem[] = await loadFreezerItemsFromGoogle(user)
        dispatchFreezer(replaceFreezerItems(newFreezerItems));
    }

    function logout() {
        setUser(null);
    }

    return (
        <div>
            <GoogleAuth onSuccess={loadFreezerItems}  onLogout={logout} />
            <AddFreezerItemForm onAddItem={handleAddItem} />
            <hr />
            <SearchFreezerItems items={freezerItems} onSearch={items => setFilteredItems(items)} />
            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Frozen on</th>
                    <th>Expires on</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {sortedItems.map(item => (
                    <FreezerItemRow item={item} key={item.id} onDelete={handleDelete} onSave={handleSave} />))}
                </tbody>
            </table>
        </div>
    );

}

export enum ActionType {
    add = "add",
    delete = "delete",
    update = "update",
    replace = "replace"
}

function addFreezerItem(item: FreezerItem) {
    return {type: ActionType.add, item} as const;
}

function deleteFreezerItem(id: number, monthsToKeepDeletedItems: number) {
    return {type: ActionType.delete, id, monthsToKeepDeletedItems} as const;
}

function updateFreezerItem(item: FreezerItem) {
    return {type: ActionType.update, item} as const;
}

function replaceFreezerItems(items: FreezerItem[]) {
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