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
import {Table, TableBody, TableHead, TableHeader, TableRow} from "./tailwind/table.tsx";

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
            <div className="flex flex-col-reverse lg:flex-row m-3">
                <AddFreezerItemForm className="" onAddItem={handleAddItem} />
                <GoogleAuth className="items-baseline-last lg:place-content-end" onSuccess={loadFreezerItems}  onLogout={logout} />
            </div>
            <hr />
            <SearchFreezerItems className="m-3"
                                items={freezerItems}
                                onSearch={(items) => dispatchSorting(updateAllItems(items))} />
            <Table className="p-3">
                <TableHead>
                    <TableRow>
                        <TableHeader className="w-12"></TableHeader>
                        <FreezerItemRowHeader className="w-80"
                                              field={FreezerField.name}
                                              sortField={sortedItems.field}
                                              sortDirection={sortedItems.direction}
                                              onClick={handleSort}>
                            Name
                        </FreezerItemRowHeader>
                        <FreezerItemRowHeader className="w-64"
                                              field={FreezerField.type}
                                              sortField={sortedItems.field}
                                              sortDirection={sortedItems.direction}
                                              onClick={handleSort}>
                            Type
                        </FreezerItemRowHeader>
                        <FreezerItemRowHeader className="w-42"
                                              field={FreezerField.unit}
                                              sortField={sortedItems.field}
                                              sortDirection={sortedItems.direction}
                                              onClick={handleSort}>
                            Amount
                        </FreezerItemRowHeader>
                        <FreezerItemRowHeader className="w-32"
                                              field={FreezerField.frozen}
                                              sortField={sortedItems.field}
                                              sortDirection={sortedItems.direction}
                                              onClick={handleSort}>
                            Frozen on
                        </FreezerItemRowHeader>
                        <FreezerItemRowHeader className="w-32"
                                              field={FreezerField.expiration}
                                              sortField={sortedItems.field}
                                              sortDirection={sortedItems.direction}
                                              onClick={handleSort}>
                            Expires on
                        </FreezerItemRowHeader>
                        <TableHeader></TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedItems.items.map(item => (
                        <FreezerItemRow item={item} key={item.id} onDelete={handleDelete} onSave={handleUpdate} />))}
                </TableBody>
            </Table>
        </div>
    );
}

export function removeDeletedItems(items: FreezerItem[]) : FreezerItem[] {
    const now = new Date().getTime();
    return items.filter(item => !item.isDeleted || item.deletedOn.getTime() > now);
}