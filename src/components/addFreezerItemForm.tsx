import {defaultFreezerItem, type FreezerItem, Unit} from "./models.ts";
import React, {useRef, useState} from "react";
import {config} from "../config.ts";
import {getDate} from "./utils.ts";
import {Field, Fieldset, Label} from "./tailwind/fieldset.tsx";
import {Input} from "./tailwind/input.tsx";
import {Button} from "./tailwind/button.tsx";
import {Select} from "./tailwind/select.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

export interface AddFreezerItemFormProps {
    className?: string | undefined;
    onAddItem: (item: FreezerItem) => void;
}

export function AddFreezerItemForm({className, onAddItem}: AddFreezerItemFormProps) {
    const today = new Date();
    const maxExpiration = getDate(config.maxExpiration);
    const unitKeys = Object.keys(Unit).filter(key => isNaN(Number(key))).sort() as Array<keyof typeof Unit>;

    // format: yyyy-mm-dd
    function formatDate(date: Date) {
        return date.toISOString().split('T')[0];
    }

    const [item, setItem] = useState<FreezerItem>(defaultFreezerItem());
    const nameInputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const {name, value} = e.target;

        const parseValue = () => {
            switch (name) {
                case 'unit':
                case 'amount':
                    return Number(value);
                case 'frozen':
                case 'expiration':
                    return new Date(value);
                default:
                    return value;
            }
        };
        setItem(prev => ({
            ...prev,
            [name]: parseValue()
        }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onAddItem(item);
        setItem(defaultFreezerItem());
        nameInputRef.current?.focus();
    }

    return (
        <form onSubmit={handleSubmit} className={className}>
            <Fieldset>
                <h3 className="text-amber-400 font-semibold">Add freezer item</h3>
                <div className="flex flex-col lg:flex-row space-x-4">
                    <Field className="w-full mt-2 md:mt-0 md:basis-80">
                        <Label htmlFor="name">Name</Label>
                        <Input type="text"
                               id="name"
                               name="name"
                               placeholder="Name"
                               onChange={handleChange}
                               value={item.name}
                               ref={nameInputRef}
                               required />
                    </Field>

                    <Field className="w-full mt-2 md:mt-0 md:basis-64">
                        <Label htmlFor="type">Product Type</Label>
                        <Input type="text"
                               id="type"
                               name="type"
                               placeholder="Type"
                               value={item.type}
                               onChange={handleChange} />
                    </Field>

                    <Field className="self-start lg:self-end w-full md:w-48 mt-2 md:mt-0">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="flex flex-nowrap mt-2.5">
                            <Input type="number"
                                   id="amount"
                                   name="amount"
                                   className="basis-2/3 md:basis-xs"
                                   min="1"
                                   value={item.amount}
                                   onChange={handleChange}
                                   required />
                            <Select id="unit" name="unit" className="basis-1/3 md:basis-sm" value={item.unit} onChange={handleChange} required>
                                {unitKeys.map(key => (
                                    <option value={Unit[key]} key={Unit[key]}>{key}</option>
                                ))}
                            </Select>
                        </div>
                    </Field>

                    <div className="flex flex-row w-full space-x-4 md:max-w-68 mt-2 md:mt-0">
                        <Field className="basis-1/2">
                            <Label htmlFor="frozen">Frozen</Label>
                            <Input type="date"
                                   id="frozen"
                                   name="frozen"
                                   value={formatDate(item.frozen)}
                                   max={formatDate(today)}
                                   onChange={handleChange}
                                   required />
                        </Field>

                        <Field className="basis-1/2">
                            <Label htmlFor="expiration">Expiration</Label>
                            <Input type="date"
                                   id="expiration"
                                   name="expiration"
                                   value={formatDate(item.expiration)}
                                   min={formatDate(today)}
                                   max={formatDate(maxExpiration)}
                                   onChange={handleChange}
                                   required />
                        </Field>
                    </div>

                    <Button type="submit" color="amber" className="self-center w-full lg:w-32 mt-6 lg:mt-0 lg:self-end">
                        <FontAwesomeIcon icon={faPlus} className="self-center" />
                        Add
                    </Button>
                </div>
            </Fieldset>
        </form>
    );
}