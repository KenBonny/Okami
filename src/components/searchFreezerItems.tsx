import type {FreezerItem} from "./models.ts";
import {useEffect, useState} from "react";
import {useDebounce} from "../effects/useDebounce.ts";

export interface SearchFreezerItemsProps{
    items: FreezerItem[];
    onSearch: (items: FreezerItem[]) => void;
}

export function SearchFreezerItems({items, onSearch}: SearchFreezerItemsProps) {
    const [terms, setTerms] = useState<string>("");
    const debouncedSearchTerms = useDebounce(terms, 500);

    useEffect(() => searchItems(debouncedSearchTerms), [debouncedSearchTerms, items])

    function handleNewSearchTerms(e: React.ChangeEvent<HTMLInputElement>) {
        setTerms(e.target.value.toLowerCase());
        searchItems(terms);
    }

    function searchItems(searchTerms: string) {
        const filteredItems = [...items].filter((item: FreezerItem) => item.name.toLowerCase().includes(searchTerms));
        onSearch(filteredItems);
    }

    return (
        <form>
            <input type="text"
                   id="searchTerms"
                   name="searchTerms"
                   onChange={handleNewSearchTerms}
                   placeholder="Search terms: steak..." />
        </form>
    );
}