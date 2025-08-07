import {AddFreezerItemForm} from "./addFreezerItemForm.tsx";
import React, {useEffect, useReducer} from "react";
import {type FreezerItem, type User} from "./models.ts";
import {SearchFreezerItems} from "./searchFreezerItems.tsx";
import FreezerItemRow from "./freezerItemRow.tsx";
import GoogleAuth from "./GoogleAuth.tsx";
import {loadFreezerItemsFromGoogle, writeFreezerItemsToGoogleDrive} from "../google/drive.ts";
import {config} from "../config.ts";
import {
    addFreezerItem,
    deleteFreezerItem,
    reduceFreezerItems,
    replaceFreezerItems,
    updateFreezerItem
} from "./freezerItemsReducer.ts";
import {
    FreezerField,
    initialSortFreezerItemsState,
    sortFreezerItemsReducer,
    sortItems,
    updateAllItems
} from "./sortFreezerItemsReducer.ts";
import FreezerItemRowHeader from "./FreezerItemRowHeader.tsx";

export const FreezerManager: React.FC = () => {
    const [freezerItems, dispatchFreezer] = useReducer(reduceFreezerItems, []);
    const [sortedItems, dispatchSorting] = useReducer(sortFreezerItemsReducer, initialSortFreezerItemsState);
    const [user, setUser] = React.useState<User | null>(null);

    useEffect(() => {
        if (user === null) return;

        console.log("save freezer items to Google Drive");
        writeFreezerItemsToGoogleDrive(user, removeDeletedItems(freezerItems))
            .then(_ => console.log("freezer items saved to Google Drive"))
            .catch(console.error);
    }, [freezerItems]);

    const handleAddItem = (newItem: FreezerItem) => {
        dispatchFreezer(addFreezerItem(newItem));
    };

    function handleDelete(id: number) {
        dispatchFreezer(deleteFreezerItem(id, config.monthsToKeepDeletedItems));
    }

    function handleUpdate(updatedItem: FreezerItem) {
        dispatchFreezer(updateFreezerItem(updatedItem));
    }

    function handleSort(field: FreezerField) {
        dispatchSorting(sortItems(field));
    }

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
            <SearchFreezerItems items={freezerItems} onSearch={(items) => dispatchSorting(updateAllItems(items))} />
            <table>
                <thead>
                <tr>
                    <th></th>
                    <FreezerItemRowHeader field={FreezerField.name} sortField={sortedItems.field} sortDirection={sortedItems.direction} onClick={handleSort}>
                        Name
                    </FreezerItemRowHeader>
                    <FreezerItemRowHeader field={FreezerField.type} sortField={sortedItems.field} sortDirection={sortedItems.direction} onClick={handleSort}>
                        Type
                    </FreezerItemRowHeader>
                    <FreezerItemRowHeader field={FreezerField.unit} sortField={sortedItems.field} sortDirection={sortedItems.direction} onClick={handleSort}>
                        Amount
                    </FreezerItemRowHeader>
                    <FreezerItemRowHeader field={FreezerField.frozen} sortField={sortedItems.field} sortDirection={sortedItems.direction} onClick={handleSort}>
                        Frozen on
                    </FreezerItemRowHeader>
                    <FreezerItemRowHeader field={FreezerField.expiration} sortField={sortedItems.field} sortDirection={sortedItems.direction} onClick={handleSort}>
                        Expires on
                    </FreezerItemRowHeader>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {sortedItems.items.map(item => (
                    <FreezerItemRow item={item} key={item.id} onDelete={handleDelete} onSave={handleUpdate} />))}
                </tbody>
            </table>
        </div>
    );
}

export function removeDeletedItems(items: FreezerItem[]) : FreezerItem[] {
    const now = new Date().getTime();
    return items.filter(item => !item.isDeleted || item.deletedOn.getTime() > now);
}