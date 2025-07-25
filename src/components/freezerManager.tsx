import {AddFreezerItemForm} from "./addFreezerItemForm.tsx";
import React, {useState} from "react";
import {Unit, type FreezerItem} from "./models.ts";

export const FreezerManager: React.FC = () => {
    const [freezerItems, setFreezerItems] = useState<FreezerItem[]>([]);

    const handleAddItem = (newItem: FreezerItem) => {
        setFreezerItems(prev => [...prev, newItem]);
    };

    const sortedItems = [...freezerItems].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    return (
        <div>
            <AddFreezerItemForm onAddItem={handleAddItem} />
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Frozen on</th>
                    <th>Expires on</th>
                </tr>
                </thead>
                <tbody>
                {sortedItems.map((item, index) => (
                    <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        <td>{item.amount} {Unit[item.unit]}</td>
                        <td>{item.frozen.toLocaleDateString()}</td>
                        <td>{item.expiration.toLocaleDateString()}</td>
                    </tr>

                ))}
                </tbody>
            </table>

        </div>
    );

}