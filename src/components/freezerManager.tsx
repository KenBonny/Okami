import {AddFreezerItemForm} from "./addFreezerItemForm.tsx";
import React, {useState} from "react";
import {type FreezerItem} from "./models.ts";
import {SearchFreezerItems} from "./searchFreezerItems.tsx";
import FreezerItemRow from "./freezerItemRow.tsx";

export const FreezerManager: React.FC = () => {
    const [freezerItems, setFreezerItems] = useState<FreezerItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<FreezerItem[]>([]);

    const handleAddItem = (newItem: FreezerItem) => {
        const ids = freezerItems.map(item => item.id);
        const nextId = Math.max(...ids, 0) + 1;
        setFreezerItems(prev => [...prev, {...newItem, id: nextId}]);
    };

    const sortedItems = [...filteredItems].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    return (
        <div>
            <AddFreezerItemForm onAddItem={handleAddItem} />
            <hr />
            <SearchFreezerItems items={freezerItems} onSearch={items => setFilteredItems(items)} />
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Frozen on</th>
                    <th>Expires on</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {sortedItems.map(item => (
                    <FreezerItemRow item={item} key={item.id} />
                ))}
                </tbody>
            </table>

        </div>
    );

}