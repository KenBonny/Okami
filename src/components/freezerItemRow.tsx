import {type FreezerItem, Unit} from "./models.ts";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilePen, faFloppyDisk, faTrash} from "@fortawesome/free-solid-svg-icons";

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
        <tr>
            <td>
                <FontAwesomeIcon icon={faFloppyDisk} onClick={save} />
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
        </tr>) : (
        <tr>
            <td><FontAwesomeIcon icon={faFilePen} onClick={() => setEditing(true)} /></td>
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