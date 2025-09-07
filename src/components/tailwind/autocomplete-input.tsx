import {useEffect, useRef, useState} from "react";
import {useDebounce} from "../../effects/useDebounce.ts";
import clsx from "clsx";
import {Input, InputGroup} from "./input.tsx";
import {autocomplete, useCombobox} from "@szhsin/react-autocomplete";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown, faCaretUp, faCircleXmark} from "@fortawesome/free-solid-svg-icons";

export interface AutoCompleteInputProps {
    items: string[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export default function AutoCompleteInput({
    items,
    value,
    onChange,
    className,
    placeholder = "Type to select an option..."
}: AutoCompleteInputProps) {
    const [text, setText] = useState<string>(value);
    const [selected, setSelected] = useState<string>();

    const availableItems = text ? items.filter(i => i.toLowerCase().includes(text.toLowerCase())) : items;

    const {
        getInputProps,
        getClearProps,
        getToggleProps,
        getListProps,
        getItemProps,
        open,
        focusIndex,
        isInputEmpty
    } = useCombobox({
        items,
        value: text,
        onChange: value => {
            const valueOrEmpty = value ?? "";
            setText(valueOrEmpty);
            onChange(valueOrEmpty);
        },
        selected,
        onSelectChange: setSelected,
        feature: autocomplete()
    });

    return (
        <div className={clsx("relative", className)}>
            <InputGroup className="flex flex-row">
                <Input type="text"
                       value={text}
                       placeholder={placeholder}
                       className={ "basis-11/12" }
                       {...getInputProps()} />
                {!isInputEmpty && <FontAwesomeIcon icon={faCircleXmark} className="basis-1/12" {...getClearProps()} />}
            </InputGroup>

            {/* Suggestions dropdown */}
            {open &&
                <ul className="absolute z-10 w-full bg-white border border-amber-400 rounded-md shadow-md mt-1 max-h-48 overflow-auto"
                    {...getListProps()}>
                    {availableItems.length ? availableItems.map((suggestion, index) => (
                            <li key={index} className={`px-3 py-2 hover:bg-amber-100 cursor-pointer ${focusIndex === index ? 'bg-amber-100' : ''}`}
                                {...getItemProps({item: suggestion, index})}>
                                {suggestion}
                            </li>
                        ))
                        : <li className="px-3 py-2">No suggestions</li>
                    }
                </ul>
            }
        </div>
    );
}

