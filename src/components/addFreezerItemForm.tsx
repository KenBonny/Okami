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
    onAddItem: (item: FreezerItem) => void;
}

export function AddFreezerItemForm({onAddItem}: AddFreezerItemFormProps) {
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
        <form onSubmit={handleSubmit}>
            <Fieldset>
                <h3 className="text-amber-400 font-semibold">Add freezer item</h3>
                <div className="flex flex-col lg:flex-row space-x-4">
                    <Field>
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

                    <Field>
                        <Label htmlFor="type">Product Type</Label>
                        <Input type="text"
                               id="type"
                               name="type"
                               placeholder="Type"
                               value={item.type}
                               onChange={handleChange} />
                    </Field>

                    <Field className="self-start lg:self-end">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="flex flex-nowrap mt-2.5">
                            <Input type="number"
                                   id="amount"
                                   name="amount"
                                   className="flex-2"
                                   min="1"
                                   value={item.amount}
                                   onChange={handleChange}
                                   required />
                            <Select id="unit" name="unit" className="flex-3" value={item.unit} onChange={handleChange} required>
                                {unitKeys.map(key => (
                                    <option value={Unit[key]} key={Unit[key]}>{key}</option>
                                ))}
                            </Select>
                        </div>
                    </Field>

                    <Field>
                        <Label htmlFor="frozen">Date Frozen</Label>
                        <Input type="date"
                               id="frozen"
                               name="frozen"
                               value={formatDate(item.frozen)}
                               max={formatDate(today)}
                               onChange={handleChange}
                               required />
                    </Field>

                    <Field>
                        <Label htmlFor="expiration">Date Frozen</Label>
                        <Input type="date"
                               id="expiration"
                               name="expiration"
                               value={formatDate(item.expiration)}
                               min={formatDate(today)}
                               max={formatDate(maxExpiration)}
                               onChange={handleChange}
                               required />
                    </Field>

                    <Button type="submit" color="amber" className="self-center w-full lg:w-32 mt-6 lg:mt-0 lg:self-end">
                        <FontAwesomeIcon icon={faPlus} className="self-center" />
                        Add
                    </Button>
                </div>
            </Fieldset>
        </form>
    );
}