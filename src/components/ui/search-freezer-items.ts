import clsx from "clsx";
import {debounce} from "../../effects/debounce.ts";
import {type FreezerItem, Unit} from "../Models.ts";
import {createInput, createInputGroup} from "./input.ts";
import {createField, createFieldset, createLabel} from "./fieldset.ts";
import {createSwitch, createSwitchField} from "./switch.ts";

export function filter(itemsToSearch: FreezerItem[], searchTerms: string, includeDeleted: boolean): FreezerItem[] {
    const lowerCaseTerms = searchTerms.toLowerCase().split(" ");
    return [...itemsToSearch]
        .filter((item: FreezerItem) => lowerCaseTerms.every(term => item.description.toLowerCase().includes(term)
            || item.type.toLowerCase().includes(term)
            || Unit[item.unit].toString().toLowerCase() === term))
        .filter(item => includeDeleted ? true : !item.isDeleted);
}

export interface SearchFreezerItemsOptions {
    items: FreezerItem[];
    className?: string;
    onSearch: (items: FreezerItem[]) => void;
    filterFn: (items: FreezerItem[], searchTerms: string, includeDeleted: boolean) => FreezerItem[];
}

export function createSearchFreezerItems(options: SearchFreezerItemsOptions): {
    root: HTMLElement;
    update: (items: FreezerItem[]) => void;
} {
    let {items, className, onSearch, filterFn} = options;
    let searchTerms = "";
    let includeDeleted = false;

    const searchIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    searchIcon.setAttribute("width", "24");
    searchIcon.setAttribute("height", "24");
    searchIcon.setAttribute("viewBox", "0 0 24 24");
    searchIcon.setAttribute("fill", "none");
    searchIcon.setAttribute("stroke", "currentColor");
    searchIcon.setAttribute("stroke-width", "2");
    searchIcon.setAttribute("stroke-linecap", "round");
    searchIcon.setAttribute("stroke-linejoin", "round");
    searchIcon.classList.add("lucide", "lucide-search");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "11");
    circle.setAttribute("cy", "11");
    circle.setAttribute("r", "8");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", "m21 21-4.35-4.35");
    searchIcon.append(circle, line);

    const {root: inputRoot, input: searchInput} = createInput({
        type: "text",
        id: "searchTerms",
        name: "searchTerms",
        placeholder: "Search by description, type or unit",
        className: "basis-11/12",
    });

    const inputGroup = createInputGroup([searchIcon, inputRoot]);

    const includeDeletedLabel = createLabel("Include deleted", {htmlFor: "includeDeleted"});
    const includeDeletedSwitch = createSwitch({name: "includeDeleted"});
    includeDeletedSwitch.id = "includeDeleted";
    const switchField = createSwitchField("shrink-0", [includeDeletedLabel, includeDeletedSwitch]);

    const searchField = createField("w-full md:flex-1", [inputGroup]);
    const fieldset = createFieldset(clsx(className, "flex flex-col gap-3 md:flex-row md:items-center md:gap-4"), [searchField, switchField]);

    function performSearch() {
        onSearch(filterFn(items, searchTerms, includeDeleted));
    }

    const debouncedSearch = debounce(performSearch, 500);

    searchInput.addEventListener("input", (e) => {
        searchTerms = (e.target as HTMLInputElement).value.toLowerCase();
        debouncedSearch();
    });

    includeDeletedSwitch.addEventListener("change", () => {
        includeDeleted = includeDeletedSwitch.checked;
        performSearch();
    });

    return {
        root: fieldset,
        update(newItems: FreezerItem[]) {
            items = newItems;
            performSearch();
        },
    };
}
