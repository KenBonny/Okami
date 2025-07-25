import {type FreezerItem, Unit} from "./models.ts";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

export interface FreezerItemRowProps {
    item: FreezerItem;
    onDelete: (id: number) => void;
}

export default function FreezerItemRow({item, onDelete}: FreezerItemRowProps) {
    return (
        <tr>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td>{item.amount} {Unit[item.unit]}</td>
            <td>{item.frozen.toLocaleDateString()}</td>
            <td>{item.expiration.toLocaleDateString()}</td>
            <td><FontAwesomeIcon icon={faTrash} onClick={() => onDelete(item.id)} /></td>
        </tr>
    );
}