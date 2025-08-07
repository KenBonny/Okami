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

export const FreezerManager: React.FC = () => {
    const [freezerItems, dispatchFreezer] = useReducer(reduceFreezerItems, []);
    const [sortedItems, dispatchSorting] = useReducer(sortFreezerItemsReducer, initialSortFreezerItemsState);
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
                    <th onClick={() => dispatchSorting(sortItems(FreezerField.name))}>Name</th>
                    <th onClick={() => dispatchSorting(sortItems(FreezerField.type))}>Type</th>
                    <th onClick={() => dispatchSorting(sortItems(FreezerField.unit))}>Amount</th>
                    <th onClick={() => dispatchSorting(sortItems(FreezerField.frozen))}>Frozen on</th>
                    <th onClick={() => dispatchSorting(sortItems(FreezerField.expiration))}>Expires on</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {sortedItems.items.map(item => (
                    <FreezerItemRow item={item} key={item.id} onDelete={handleDelete} onSave={handleSave} />))}
                </tbody>
            </table>
        </div>
    );
}