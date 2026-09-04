import type {FreezerItem, User} from "./Models.ts";
import {freezerItemsStore, sortedFreezerItemsStore} from "./stores.ts";
import {
    addFreezerItem,
    deleteFreezerItem,
    replaceFreezerItems,
    updateFreezerItem,
} from "./FreezerItemsReducer.ts";
import {FreezerField, SortDirection, sortItems, updateAllItems} from "./SortFreezerItemsReducer.ts";
import {loadFreezerItemsFromGoogle, writeFreezerItemsToGoogleDrive} from "../google/drive.ts";
import {removeDeletedItems} from "./RemoveDeletedItems.ts";
import {config} from "../config.ts";
import {createAddFreezerItemForm} from "./ui/add-freezer-item-form.ts";
import {createSearchFreezerItems} from "./ui/search-freezer-items.ts";
import {filter} from "./SearchFreezerItems.tsx";
import {createTable, createTableBody, createTableHead, createTableRow, createTableHeader} from "./ui/table.ts";
import {createFreezerItemRow} from "./ui/freezer-item-row.ts";
import {createFreezerItemRowHeader} from "./ui/freezer-item-row-header.ts";
import okamiImage from "../assets/okami.png";

export interface ManagerOptions {
    rootElement: HTMLElement;
    googleAuthComponent: HTMLElement; // React GoogleAuth component (mounted separately)
    onAuthSuccess?: (user: User) => void;
    onAuthLogout?: () => void;
}

export function createManager(options: ManagerOptions) {
    const {rootElement, googleAuthComponent} = options;

    // Store subscriptions
    let currentUser: User | null = null;

    // Create main layout
    const nav = document.createElement("nav");
    nav.className = "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm";

    const navInner = document.createElement("div");
    navInner.className = "flex items-center gap-4 px-4 py-2 max-w-screen-2xl mx-auto";

    const logoLink = document.createElement("a");
    logoLink.href = "/";
    logoLink.className = "flex items-center gap-2 no-underline hover:no-underline shrink-0";
    const logoImg = document.createElement("img");
    logoImg.src = okamiImage.src;
    logoImg.alt = "";
    logoImg.className = "h-8 w-8 object-contain";
    logoImg.setAttribute("aria-hidden", "true");
    const logoText = document.createElement("span");
    logoText.className = "font-semibold text-amber-400 text-lg leading-none";
    logoText.textContent = "Okami";
    logoLink.append(logoImg, logoText);

    const aboutLink = document.createElement("a");
    aboutLink.href = "/about";
    aboutLink.className = "text-sm shrink-0";
    aboutLink.textContent = "About";

    const authContainer = document.createElement("div");
    authContainer.className = "flex-1 flex justify-end";
    authContainer.append(googleAuthComponent);

    navInner.append(logoLink, aboutLink, authContainer);
    nav.append(navInner);

    // Main content area
    const mainDiv = document.createElement("div");
    mainDiv.className = "mx-auto max-w-screen-2xl px-3 sm:px-6";

    // Add form
    const formContainer = document.createElement("div");
    formContainer.className = "mt-4 mb-3";

    const addForm = createAddFreezerItemForm({
        items: freezerItemsStore.getState(),
        className: undefined,
        onAddItem: (item: FreezerItem) => {
            freezerItemsStore.dispatch(addFreezerItem(item));
        },
        defaultExpirationMonths: config.defaultExpiration,
    });
    formContainer.append(addForm.root);

    // Search section
    const searchContainer = document.createElement("div");
    searchContainer.className = "my-3";
    const search = createSearchFreezerItems({
        items: freezerItemsStore.getState(),
        className: undefined,
        onSearch: (items: FreezerItem[]) => {
            sortedFreezerItemsStore.dispatch(updateAllItems(items));
        },
        filterFn: filter,
    });
    searchContainer.append(search.root);

    // Table
    const tableHeadRow = createTableRow(undefined, [
        createTableHeader("w-12", []),
        createFreezerItemRowHeader({
            field: FreezerField.description,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            className: "w-80",
            label: "Description",
            onClick: (field) => {
                sortedFreezerItemsStore.dispatch(sortItems(field));
            },
        }),
        createFreezerItemRowHeader({
            field: FreezerField.type,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            className: "w-64",
            label: "Type",
            onClick: (field) => {
                sortedFreezerItemsStore.dispatch(sortItems(field));
            },
        }),
        createFreezerItemRowHeader({
            field: FreezerField.unit,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            className: "w-42",
            label: "Amount",
            onClick: (field) => {
                sortedFreezerItemsStore.dispatch(sortItems(field));
            },
        }),
        createFreezerItemRowHeader({
            field: FreezerField.frozen,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            className: "w-32",
            label: "Frozen on",
            onClick: (field) => {
                sortedFreezerItemsStore.dispatch(sortItems(field));
            },
        }),
        createFreezerItemRowHeader({
            field: FreezerField.expiration,
            sortField: FreezerField.description,
            sortDirection: SortDirection.ascending,
            className: "w-32",
            label: "Expires on",
            onClick: (field) => {
                sortedFreezerItemsStore.dispatch(sortItems(field));
            },
        }),
        createTableHeader("w-12", []),
    ]);

    const tableHead = createTableHead([tableHeadRow]);
    const tableBody = createTableBody([]);
    const table = createTable("p-3", [tableHead, tableBody]);

    mainDiv.append(formContainer, document.createElement("hr"), searchContainer, table);

    // Root
    const appRoot = document.createElement("div");
    appRoot.append(nav, mainDiv);
    rootElement.append(appRoot);

    // Wire up stores
    freezerItemsStore.subscribe((items) => {
        console.log("[Manager] Items updated:", items.length);
        search.update(items);
        addForm.update(items);

        // Update table body
        tableBody.innerHTML = "";
        const sortedState = sortedFreezerItemsStore.getState();
        sortedState.items.forEach((item) => {
            const row = createFreezerItemRow({
                item,
                onDelete: (id) => {
                    freezerItemsStore.dispatch(deleteFreezerItem(id, config.monthsToKeepDeletedItems));
                },
                onSave: (updatedItem) => {
                    freezerItemsStore.dispatch(updateFreezerItem(updatedItem));
                },
            });
            tableBody.append(row.root);
        });

        // Autosave to Drive
        if (currentUser) {
            console.log("[Manager] Autosaving to Drive...");
            writeFreezerItemsToGoogleDrive(currentUser, removeDeletedItems(items))
                .then(() => console.log("[Manager] Autosave complete"))
                .catch(console.error);
        }
    });

    sortedFreezerItemsStore.subscribe((sortedState) => {
        console.log("[Manager] Sorted state updated");
        // Update table with sorted items
        tableBody.innerHTML = "";
        sortedState.items.forEach((item) => {
            const row = createFreezerItemRow({
                item,
                onDelete: (id) => {
                    freezerItemsStore.dispatch(deleteFreezerItem(id, config.monthsToKeepDeletedItems));
                },
                onSave: (updatedItem) => {
                    freezerItemsStore.dispatch(updateFreezerItem(updatedItem));
                },
            });
            tableBody.append(row.root);
        });
    });

    return {
        setUser(user: User | null) {
            currentUser = user;
            if (user) {
                console.log(`[Manager] Loading items for: ${user.name}`);
                loadFreezerItemsFromGoogle(user)
                    .then((items) => {
                        console.log(`[Manager] Loaded ${items.length} items from Drive`);
                        freezerItemsStore.dispatch(replaceFreezerItems(items));
                    })
                    .catch(console.error);
            }
        },
    };
}
