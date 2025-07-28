import {type FreezerItem, Unit} from "./models.ts";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilePen, faFloppyDisk, faTrash} from "@fortawesome/free-solid-svg-icons";

export interface DisplayFreezerItemRowProps {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
}

export function DisplayFreezerItemRow({item, onDelete, onEdit}: DisplayFreezerItemRowProps) {
    return (
        <tr>
            <td><FontAwesomeIcon icon={faFilePen} onClick={() => onEdit(item.id)} /></td>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td>{item.amount} {Unit[item.unit]}</td>
            <td>{item.frozen.toLocaleDateString()}</td>
            <td>{item.expiration.toLocaleDateString()}</td>
            <td>
                {!item.isDeleted &&
                    <FontAwesomeIcon icon={faTrash} onClick={() => onDelete(item.id)} />}
            </td>
        </tr>
    );
}

export interface EditFreezerItemRowProps {
    item: FreezerItem;
    onSave: (item: FreezerItem) => void;
}

export function EditFreezerItemRow({item, onSave}: EditFreezerItemRowProps) {
    const [editedItem, setEditedItem] = React.useState<FreezerItem>({...item});

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setEditedItem({...editedItem, [name]: name === 'amount' ? Number(value) : value});
    }

    return (
        <tr>
            <td>
                <FontAwesomeIcon icon={faFloppyDisk} onClick={() => onSave(editedItem)} />
            </td>
            <td><input type="text"
                       id="name"
                       name="name"
                       placeholder="Name"
                       value={editedItem.name}
                       onChange={handleChange}
                       required /></td>
            <td>{editedItem.type}</td>
            <td><input type="number"
                       id="amount"
                       name="amount"
                       min="1"
                       value={editedItem.amount}
                       onChange={handleChange}
                       required />
                {Unit[editedItem.unit]}</td>
            <td>{editedItem.frozen.toLocaleDateString()}</td>
            <td>{editedItem.expiration.toLocaleDateString()}</td>
            <td></td>
        </tr>);
}