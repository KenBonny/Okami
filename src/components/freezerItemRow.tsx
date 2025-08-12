import {type FreezerItem, Unit} from "./models.ts";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilePen, faFloppyDisk, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableCell, TableRow} from "./tailwind/table.tsx";
import {Input} from "./tailwind/input.tsx";

export interface FreezerItemRowProps {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onSave: (item: FreezerItem) => void;
}

export default function FreezerItemRow({item, onSave, onDelete}: FreezerItemRowProps) {
    const [editing, setEditing] = React.useState(false);
    const [editedItem, setEditedItem] = React.useState<FreezerItem>({...item});

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setEditedItem({...editedItem, [name]: name === 'amount' ? Number(value) : value});
    }

    function save() {
        setEditing(false);
        onSave(editedItem);
    }

    return editing ? (
        <TableRow key={item.id}>
            <TableCell className="text-amber-400 px-4">
                <FontAwesomeIcon icon={faFloppyDisk} className="ml-4"  onClick={save} />
            </TableCell>
            <TableCell>
                <Input type="text"
                       id="name"
                       name="name"
                       placeholder="Name"
                       className="min-w-32 max-w-64"
                       value={editedItem.name}
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
        <TableRow key={item.id}>
            <TableCell className="text-amber-400">
                <FontAwesomeIcon icon={faFilePen} className="ml-4" onClick={() => setEditing(true)} />
            </TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.amount} {Unit[item.unit]}</TableCell>
            <TableCell>{item.frozen.toLocaleDateString()}</TableCell>
            <TableCell>{item.expiration.toLocaleDateString()}</TableCell>
            <TableCell className="text-zinc-400">
                {!item.isDeleted &&
                    <FontAwesomeIcon icon={faTrash} onClick={() => onDelete(item.id)} />}
            </TableCell>
        </TableRow>
    );
}