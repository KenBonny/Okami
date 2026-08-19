import {defaultFreezerItem, type FreezerItem, Unit} from "./Models.ts";
import React, {useEffect, useRef, useState} from "react";
import {Field, Fieldset, Label} from "./tailwind/fieldset.tsx";
import {Input} from "./tailwind/input.tsx";
import {Button} from "./tailwind/button.tsx";
import AutoCompleteInput from "./tailwind/autocomplete-input.tsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {ChevronDownIcon, PlusIcon} from "@heroicons/react/16/solid";
import clsx from "clsx";

export interface AddFreezerItemFormProps {
    className?: string | undefined;
    items: FreezerItem[];
    onAddItem: (item: FreezerItem) => void;
}

export function AddFreezerItemForm({className, items, onAddItem}: AddFreezerItemFormProps) {
    const today = new Date();
    const unitKeys = Object.keys(Unit).filter(key => isNaN(Number(key))).sort() as Array<keyof typeof Unit>;
    const [types, setTypes] = useState<string[]>(uniqueTypes(items));
    const [item, setItem] = useState<FreezerItem>(defaultFreezerItem());
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setTypes(uniqueTypes(items));
    }, [items]);

    const descriptionRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const {name, value} = e.target;

        const parseValue = () => {
            switch (name) {
                case 'unit':
                case 'amount':
                    return Number(value);
                default:
                    return value;
            }
        };
        setItemValue(name, parseValue());
    }

    function setItemValue(name: string, value: string | number | Date | null) {
        if (value === null) return;
        setItem(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleTypeChange(chosenType: string) {
        setItem(prev => ({
            ...prev,
            type: chosenType,
        }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onAddItem(item);
        setItem(defaultFreezerItem());
        descriptionRef.current?.focus();
    }

    return (
        <form onSubmit={handleSubmit} className={className}>
            <Fieldset>
                {/* Mobile: tappable toggle; Desktop: static heading */}
                <button
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="flex items-center justify-between w-full text-left lg:hidden py-1"
                    aria-expanded={isOpen}
                >
                    <span className="text-base font-semibold text-amber-400 underline decoration-amber-400">
                        Add freezer item
                    </span>
                    <ChevronDownIcon className={clsx(
                        "size-5 text-zinc-400 transition-transform duration-200 shrink-0",
                        isOpen && "rotate-180"
                    )} />
                </button>
                <h3 className="hidden lg:block text-amber-400">Add freezer item</h3>

                {/* Form fields — hidden on mobile when collapsed, always visible on lg */}
                <div className={clsx(
                    "flex-col lg:flex-row gap-4 lg:items-end mt-2",
                    isOpen ? "flex" : "hidden lg:flex"
                )}>
                    <Field className="w-full lg:basis-80 lg:grow-0 lg:shrink-0">
                        <Label htmlFor="description">Description</Label>
                        <Input type="text"
                               id="description"
                               name="description"
                               placeholder="Description"
                               onChange={handleChange}
                               value={item.description}
                               ref={descriptionRef}
                               required/>
                    </Field>

                    <Field className="w-full lg:basis-64 lg:grow-0 lg:shrink-0">
                        <Label>Item Type</Label>
                        <AutoCompleteInput items={types}
                                           placeholder="Item Type"
                                           className="mt-2.5"
                                           value={item.type}
                                           onChange={handleTypeChange}/>
                    </Field>

                    <Field className="w-full lg:w-auto lg:shrink-0">
                        <Label htmlFor="amount">Amount</Label>
                        {/* Cohesive amount + unit input — shares one border and focus ring */}
                        <div className="mt-2.5 flex rounded-lg ring-1 ring-inset ring-zinc-950/10 shadow-sm
                                        focus-within:ring-2 focus-within:ring-inset focus-within:ring-amber-400
                                        bg-white overflow-hidden">
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                min="1"
                                value={item.amount}
                                onChange={handleChange}
                                required
                                className="block flex-1 min-w-0 border-0 bg-transparent
                                           px-3.5 py-2.5 sm:px-3 sm:py-1.5
                                           text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6
                                           focus:outline-none focus:ring-0"
                            />
                            <div className="relative flex items-center border-l border-zinc-950/10 bg-zinc-50 shrink-0">
                                <select
                                    id="unit"
                                    name="unit"
                                    value={item.unit}
                                    onChange={handleChange}
                                    required
                                    className="appearance-none border-0 bg-transparent
                                               py-2.5 sm:py-1.5 pl-3 pr-8
                                               text-base/6 text-zinc-950 sm:text-sm/6
                                               focus:outline-none focus:ring-0 cursor-pointer"
                                >
                                    {unitKeys.map(key => (
                                        <option value={Unit[key]} key={Unit[key]}>{key}</option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-2 flex items-center" aria-hidden="true">
                                    <svg className="size-4 stroke-zinc-500" viewBox="0 0 16 16" fill="none">
                                        <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Field>

                    <div className="flex flex-row w-full gap-4 lg:max-w-72 lg:shrink-0">
                        <Field className="basis-1/2">
                            <Label htmlFor="frozen">Frozen</Label>
                            <DatePicker id="frozen"
                                        name="frozen"
                                        dateFormat="dd/MM/yyyy"
                                        className="w-full mt-2.5"
                                        required
                                        selected={item.frozen}
                                        maxDate={today}
                                        onChange={date => setItemValue("frozen", date)}
                                        customInput={<Input type="text" />} />
                        </Field>

                        <Field className="basis-1/2">
                            <Label htmlFor="expiration">Expiration</Label>
                            <DatePicker id="expiration"
                                        name="expiration"
                                        dateFormat="dd/MM/yyyy"
                                        className="w-full mt-2.5"
                                        required
                                        selected={item.expiration}
                                        minDate={today}
                                        onChange={date => setItemValue("expiration", date)}
                                        customInput={<Input type="text" />} />
                        </Field>
                    </div>

                    <Button type="submit" color="amber" className="w-full lg:w-auto lg:shrink-0 lg:self-end">
                        <PlusIcon />
                        Add
                    </Button>
                </div>
            </Fieldset>
        </form>
    );
}

function uniqueTypes(items: FreezerItem[]): string[] {
    const types = [...items.map((item) => item.type)].filter(type => type !== "");
    return Array.from(new Set(types)).sort((left, right) => left.localeCompare(right));
}
