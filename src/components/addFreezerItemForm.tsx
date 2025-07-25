import {type FreezerItem, Unit} from "./models.ts";
import React, {useRef, useState} from "react";

export interface AddFreezerItemFormProps {
    onAddItem: (item: FreezerItem) => void;
}

export function AddFreezerItemForm({onAddItem}: AddFreezerItemFormProps) {
    const [item, setItem] = useState<FreezerItem>(defaultValues());
    const nameInputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const {name, value} = e.target;
        setItem(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) :
                name === 'frozen' || name === 'expiration' ? new Date(value) :
                    name === 'unit' ? Number(value) : value
        }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onAddItem(item);
        setItem(defaultValues());
        nameInputRef.current?.focus();
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input type="text"
                   id="name"
                   name="name"
                   value={item.name}
                   onChange={handleChange}
                   ref={nameInputRef}
                   required />

            <label htmlFor="type">Product Type</label>
            <input type="text" id="type" name="type" value={item.type} onChange={handleChange} />

            <label htmlFor="frozen">Date Frozen</label>
            <input type="date"
                   id="frozen"
                   name="frozen"
                   value={formatDate(item.frozen)}
                   max={formatDate(today)}
                   onChange={handleChange}
                   required />

            <label htmlFor="expiration">Date Frozen</label>
            <input type="date"
                   id="expiration"
                   name="expiration"
                   value={formatDate(item.expiration)}
                   min={formatDate(today)}
                   max={formatDate(maxExpiration)}
                   onChange={handleChange}
                   required />

            <label htmlFor="amount">Amount</label>
            <input type="number"
                   id="amount"
                   name="amount"
                   min="1"
                   value={item.amount}
                   onChange={handleChange}
                   required />

            <select id="unit" name="unit" onChange={handleChange} required>
                {unitKeys.map(key => (
                    <option value={Unit[key]}>{key}</option>
                ))}
            </select>

            <button type="submit">Add</button>
        </form>
    );
}

const today = new Date();
const defaultExpiration = getDate(12);
const maxExpiration = getDate(24);
const unitKeys = Object.keys(Unit).filter(key => isNaN(Number(key))).sort() as Array<keyof typeof Unit>;
const defaultValues = () => ({
    id: 0,
    name: "",
    type: "",
    amount: 1,
    unit: Unit.gram,
    frozen: today,
    expiration: defaultExpiration,
    created: new Date()
} as FreezerItem);

function getDate(monthsFromNow: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return date;
}

// format: yyyy-mm-dd
function formatDate(date: Date) {
    return date.toISOString().split('T')[0];
}