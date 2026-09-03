import {createStore} from "../store.ts";
import {type FreezerAction, reduceFreezerItems} from "./FreezerItemsReducer.ts";
import {
    initialSortFreezerItemsState,
    type SortedFreezerItems,
    sortFreezerItemsReducer,
    type SortType
} from "./SortFreezerItemsReducer.ts";
import type {FreezerItem} from "./Models.ts";

export const freezerItemsStore = createStore<FreezerItem[], FreezerAction>(reduceFreezerItems, []);
export const sortedFreezerItemsStore = createStore<SortedFreezerItems, SortType>(sortFreezerItemsReducer, initialSortFreezerItemsState);
