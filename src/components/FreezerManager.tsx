import {AddFreezerItemForm} from "./AddFreezerItemForm.tsx";
import React, {useEffect, useState} from "react";
import {type FreezerItem, type User} from "./Models.ts";
import {SearchFreezerItems} from "./SearchFreezerItems.tsx";
import FreezerItemRow from "./FreezerItemRow.tsx";
import GoogleAuth from "./GoogleAuth.tsx";
import {loadFreezerItemsFromGoogle, writeFreezerItemsToGoogleDrive} from "../google/drive.ts";
import {removeDeletedItems} from "./RemoveDeletedItems.ts";
import {config} from "../config.ts";
import {
    addFreezerItem,
    deleteFreezerItem,
    replaceFreezerItems,
    updateFreezerItem
} from "./FreezerItemsReducer.ts";
import {
    FreezerField,
    sortItems,
    updateAllItems
} from "./SortFreezerItemsReducer.ts";
import FreezerItemRowHeader from "./FreezerItemRowHeader.tsx";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "./tailwind/table.tsx";
import okamiImage from "../assets/okami.png";
import {freezerItemsStore, sortedFreezerItemsStore} from "./stores.ts";

export const FreezerManager: React.FC = () => {
    const [freezerItems, setFreezerItems] = useState(freezerItemsStore.getState());
    const [sortedItems, setSortedItems] = useState(sortedFreezerItemsStore.getState());
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        console.log("[FreezerManager] Setting up freezerItems subscription, current state:", freezerItemsStore.getState());
        const unsubscribe = freezerItemsStore.subscribe((items) => {
            console.log("[FreezerManager] freezerItems updated:", items.length, "items");
            setFreezerItems(items);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = sortedFreezerItemsStore.subscribe(setSortedItems);
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (user === null) return;

        console.log("save freezer items to Google Drive");
        writeFreezerItemsToGoogleDrive(user, removeDeletedItems(freezerItems))
            .then(_ => console.log("freezer items saved to Google Drive"))
            .catch(console.error);
    }, [freezerItems, user]);

    function handleAddItem(newItem: FreezerItem) {
        freezerItemsStore.dispatch(addFreezerItem(newItem));
    }

    function handleDelete(id: number) {
        freezerItemsStore.dispatch(deleteFreezerItem(id, config.monthsToKeepDeletedItems));
    }

    function handleUpdate(updatedItem: FreezerItem) {
        freezerItemsStore.dispatch(updateFreezerItem(updatedItem));
    }

    function handleSort(field: FreezerField) {
        sortedFreezerItemsStore.dispatch(sortItems(field));
    }

    async function loadFreezerItems(user: User) {
        console.log(`[FreezerManager] loadFreezerItems called for: ${user.name}`);
        setUser(user);
        try {
            console.log(`[FreezerManager] Fetching items from Google Drive...`);
            const newFreezerItems: FreezerItem[] = await loadFreezerItemsFromGoogle(user);
            console.log(`[FreezerManager] Loaded ${newFreezerItems.length} items, dispatching to store...`);
            freezerItemsStore.dispatch(replaceFreezerItems(newFreezerItems));
            console.log(`[FreezerManager] Store state after dispatch:`, freezerItemsStore.getState());
        } catch (error) {
            console.error(`[FreezerManager] Error loading items from Drive:`, error);
        }
    }

    function logout() {
        setUser(null);
    }

    return (
        <div>
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 px-4 py-2 max-w-screen-2xl mx-auto">
                    <a href="/" className="flex items-center gap-2 no-underline hover:no-underline shrink-0">
                        <img src={okamiImage.src} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
                        <span className="font-semibold text-amber-400 text-lg leading-none">Okami</span>
                    </a>
                    <a href="/about" className="text-sm shrink-0">About</a>
                    <div className="flex-1 flex justify-end">
                        <GoogleAuth className="justify-end" onSuccess={loadFreezerItems} onLogout={logout} />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-screen-2xl px-3 sm:px-6">
                <div className="mt-4 mb-3">
                    <AddFreezerItemForm items={freezerItems} onAddItem={handleAddItem} />
                </div>
                <hr className="border-gray-900/10" />
                <SearchFreezerItems className="my-3"
                                    items={freezerItems}
                                    onSearch={(items) => sortedFreezerItemsStore.dispatch(updateAllItems(items))} />
                <Table className="p-3">
                    <TableHead>
                        <TableRow>
                            <TableHeader className="w-12" />
                            <FreezerItemRowHeader className="w-80"
                                                  field={FreezerField.description}
                                                  sortField={sortedItems.field}
                                                  sortDirection={sortedItems.direction}
                                                  onClick={handleSort}>
                                Description
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
                            <TableHeader className="w-12" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedItems.items.map(item => (
                            <FreezerItemRow item={item} key={item.id} onDelete={handleDelete} onSave={handleUpdate} />))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
