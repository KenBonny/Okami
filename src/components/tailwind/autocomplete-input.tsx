import {useEffect, useState} from "react";
import {useDebounce} from "../../effects/useDebounce.ts";
import clsx from "clsx";
import {Input} from "./input.tsx";

export interface AutoCompleteInputProps {
    items: string[];
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;

}

export default function AutoCompleteInput({
                                              items,
                                              onChange,
                                              className,
                                              placeholder = "Type to select an option..."
                                          }: AutoCompleteInputProps) {
    const [value, setValue] = useState<string>(""); // Current input value
    const [suggestions, setSuggestions] = useState<string[]>(items); // Filtered suggestions
    const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false); // To control dropdown visibility
    const debouncedValue = useDebounce(value, 300); // Debounced input to optimize filtering

    useEffect(() => {
        // Filter suggestions based on the input value
        if (debouncedValue.trim() === "") {
            setSuggestions(items);
            setDropdownVisible(items.length > 0)
        } else {
            const filteredSuggestions = items.filter((item) =>
                item.toLowerCase().startsWith(debouncedValue.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
            setDropdownVisible(filteredSuggestions.length > 0);
        }
    }, [debouncedValue, items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e.target.value); // Notify parent about the input value
    };

    const handleSuggestionClick = (suggestion: string) => {
        setValue(suggestion); // Set the selected suggestion as the input value
        onChange(suggestion); // Notify parent about the selected suggestion
        setDropdownVisible(false); // Close the dropdown
    };

    return (
        <div className={clsx("relative", className)}>
            {/* Input field */}
            <Input
                type="text"
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                onFocus={() => setDropdownVisible(suggestions.length > 0)} // Show suggestions when focused
                onBlur={() => setTimeout(() => setDropdownVisible(false), 200)} // Hide dropdown with delay to handle click
            />

            {/* Suggestions dropdown */}
            {isDropdownVisible && (
                <ul
                    className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-48 overflow-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

