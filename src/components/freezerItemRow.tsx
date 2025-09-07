import {type FreezerItem, Unit} from "./models.ts";
import React from "react";
import {TableCell, TableRow} from "./tailwind/table.tsx";
import {Input} from "./tailwind/input.tsx";
import {config, type WarningConfig} from "../config.ts";
import {CheckCircleIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/solid";

export interface FreezerItemRowProps {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onSave: (item: FreezerItem) => void;
}

export default function FreezerItemRow({item, onSave, onDelete}: FreezerItemRowProps) {
    const [editing, setEditing] = React.useState(false);
    const [editedItem, setEditedItem] = React.useState<FreezerItem>({...item});
    const warningCss = determineWarning(item.expiration, new Date(), config.warnings).toString();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setEditedItem({...editedItem, [name]: name === 'amount' ? Number(value) : value});
    }

    function save() {
        setEditing(false);
        onSave(editedItem);
    }

    return editing ? (
        <TableRow key={item.id} className={warningCss}>
            <TableCell>
                <CheckCircleIcon className="m-2 text-green-700 cursor-pointer"  onClick={save} />
            </TableCell>
            <TableCell>
                <Input type="text"
                       id="description"
                       name="description"
                       placeholder="Description"
                       className="min-w-32 max-w-64"
                       value={editedItem.description}
                       onChange={handleChange}
                       required />
            </TableCell>
            <TableCell>{editedItem.type}</TableCell>
            <TableCell className="flex flex-nowrap items-center space-x-2">
                <Input type="number"
                       id="amount"
                       name="amount"
                       placeholder="Amount"
                       className="basis-2/3"
                       min="1"
                       value={editedItem.amount}
                       onChange={handleChange}
                       required />
                <p className="basis-1/3">{Unit[editedItem.unit]}</p>
            </TableCell>
            <TableCell>{editedItem.frozen.toLocaleDateString()}</TableCell>
            <TableCell>{editedItem.expiration.toLocaleDateString()}</TableCell>
            <TableCell></TableCell>
        </TableRow>) : (
        <TableRow key={item.id} className={warningCss}>
            <TableCell className="">
                <PencilSquareIcon className="m-2 text-amber-400 cursor-pointer" onClick={() => setEditing(true)} />
            </TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.amount} {Unit[item.unit]}</TableCell>
            <TableCell>{item.frozen.toLocaleDateString()}</TableCell>
            <TableCell>{item.expiration.toLocaleDateString()}</TableCell>
            <TableCell>
                {!item.isDeleted &&
                    <TrashIcon className="m-2 text-red-500 cursor-pointer" onClick={() => onDelete(item.id)} />}
            </TableCell>
        </TableRow>
    );
}

export class WarningText{
    static readonly ok = "";
    static readonly first = "first-warning";
    static readonly second = "second-warning";
    static readonly expired = "expired";
}

type WarningStatus = typeof WarningText[keyof typeof WarningText];

export function determineWarning(expiration: Date, today: Date, config: WarningConfig) : WarningStatus {
    if (today >= expiration) return WarningText.expired

    const secondWarning = new Date(expiration);
    secondWarning.setMonth(secondWarning.getMonth() - config.monthsBeforeSecond);
    if (today >= secondWarning) return WarningText.second

    const firstWarning = new Date(expiration);
    firstWarning.setMonth(firstWarning.getMonth() - config.monthsBeforeFirst);
    if (today >= firstWarning) return WarningText.first
    return WarningText.ok;
}