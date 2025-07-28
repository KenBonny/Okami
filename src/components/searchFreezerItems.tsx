import {type FreezerItem, Unit} from "./models.ts";
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

    useEffect(() => search(terms, includeDeleted), [items, debouncedSearchTerms, includeDeleted])

    function handleNewSearchTerms(e: React.ChangeEvent<HTMLInputElement>) {
        const termsInput = e.target.value.toLowerCase();
        setTerms(termsInput);
        search(termsInput, includeDeleted);
    }

    function handleIncludeDeleted(e: React.ChangeEvent<HTMLInputElement>) {
        const includeDeletedCheckBox = e.target.checked;
        setIncludeDeleted(includeDeletedCheckBox);
        search(terms, includeDeletedCheckBox);
    }

    function search(searchTerms: string, includeDeleted: boolean) {
        onSearch(filter(items, searchTerms, includeDeleted));
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

export function filter(itemsToSearch: FreezerItem[], searchTerms: string, includeDeleted: boolean) : FreezerItem[] {
    const lowerCaseTerms = searchTerms.toLowerCase();
    return [...itemsToSearch]
        .filter((item: FreezerItem) => item.name.toLowerCase().includes(lowerCaseTerms)
            || Unit[item.unit].toString().toLowerCase() === lowerCaseTerms)
        .filter(item => includeDeleted ? true : !item.isDeleted);
}