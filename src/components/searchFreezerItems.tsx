import type {FreezerItem} from "./models.ts";
import {useEffect, useState} from "react";
import {useDebounce} from "../effects/useDebounce.ts";

export interface SearchFreezerItemsProps{
    items: FreezerItem[];
    onSearch: (items: FreezerItem[]) => void;
}

export function SearchFreezerItems({items, onSearch}: SearchFreezerItemsProps) {
    const [terms, setTerms] = useState<string>("");
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const debouncedSearchTerms = useDebounce(terms, 500);

    useEffect(() => searchItems(terms, includeDeleted), [debouncedSearchTerms, items])

    function handleNewSearchTerms(e: React.ChangeEvent<HTMLInputElement>) {
        const termsInput = e.target.value.toLowerCase();
        setTerms(termsInput);
        searchItems(termsInput, includeDeleted);
    }

    function handleIncludeDeleted(e: React.ChangeEvent<HTMLInputElement>) {
        const includeDeletedCheckBox = e.target.checked;
        setIncludeDeleted(includeDeletedCheckBox);
        searchItems(terms, includeDeletedCheckBox);
    }

    function searchItems(searchTerms: string, includeDeleted: boolean) {
        const filteredItems = [...items].filter((item: FreezerItem) => item.name.toLowerCase().includes(searchTerms.toLowerCase()))
            .filter(item => includeDeleted ? true : !item.isDeleted);
        onSearch(filteredItems);
    }

    return (
        <form>
            <input type="text"
                   id="searchTerms"
                   name="searchTerms"
                   onChange={handleNewSearchTerms}
                   placeholder="Search terms: steak..." />

            <label>
                <input type="checkbox"
                       id="includeDeleted"
                       name="includeDeleted"
                       onChange={handleIncludeDeleted} />
                Include deleted
            </label>
        </form>
    );
}