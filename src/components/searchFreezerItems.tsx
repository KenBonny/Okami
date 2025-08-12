import {type FreezerItem, Unit} from "./models.ts";
import {useEffect, useState} from "react";
import {useDebounce} from "../effects/useDebounce.ts";
import {Input} from "./tailwind/input.tsx";
import {Field, Fieldset, Label} from "./tailwind/fieldset.tsx";
import {Switch, SwitchField} from "./tailwind/switch.tsx";
import clsx from "clsx";

export interface SearchFreezerItemsProps{
    className?: string | undefined;
    items: FreezerItem[];
    onSearch: (items: FreezerItem[]) => void;
}

export function SearchFreezerItems({className, items, onSearch}: SearchFreezerItemsProps) {
    const [terms, setTerms] = useState<string>("");
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const debouncedSearchTerms = useDebounce(terms, 500);

    useEffect(() => search(terms, includeDeleted), [items, debouncedSearchTerms, includeDeleted])

    function handleNewSearchTerms(e: React.ChangeEvent<HTMLInputElement>) {
        const termsInput = e.target.value.toLowerCase();
        setTerms(termsInput);
        search(termsInput, includeDeleted);
    }

    function handleIncludeDeleted(included: boolean) {
        setIncludeDeleted(included);
        search(terms, included);
    }

    function search(searchTerms: string, includeDeleted: boolean) {
        onSearch(filter(items, searchTerms, includeDeleted));
    }

    return (
        <Fieldset className={clsx(className, "flex flex-nowrap flex-auto content-center")} >
            <Field className="min-w-2xs max-w-md w-full mr-4">
                <Input type="text"
                       id="searchTerms"
                       name="searchTerms"
                       onChange={handleNewSearchTerms}
                       placeholder="Search by name, type or unit" />
            </Field>
            <SwitchField className="self-center">
                <Label>Include deleted</Label>
                <Switch name="includeDeleted" color="amber" onChange={handleIncludeDeleted} />
            </SwitchField>
        </Fieldset>
    );
}

export function filter(itemsToSearch: FreezerItem[], searchTerms: string, includeDeleted: boolean) : FreezerItem[] {
    const lowerCaseTerms = searchTerms.toLowerCase().split(" ");
    return [...itemsToSearch]
        .filter((item: FreezerItem) => lowerCaseTerms.every(term => item.name.toLowerCase().includes(term)
            || item.type.toLowerCase().includes(term)
            || Unit[item.unit].toString().toLowerCase() === term))
        .filter(item => includeDeleted ? true : !item.isDeleted);
}