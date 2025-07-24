import {AddFreezerItemForm, type FreezerItem} from "./freezerItem.tsx";
import {useState} from "react";
import {Unit} from "./unit.ts";

export const FreezerManager : React.FC = () => {
    const [freezerItems, setFreezerItems] = useState<FreezerItem[]>([]);

    const handleAddItem = (newItem: FreezerItem) => {
        setFreezerItems(prev => [...prev, newItem]);
    };

    return (
        <div>
            <AddFreezerItemForm onAddItem={handleAddItem} />
            <ul>
                {freezerItems.sort((a, b) => a.name > b.name ? 1 : 0).map((item, index) => (
                    <li key={index}>
                        {item.name} - {item.amount} {Unit[item.unit].toLowerCase()}
                    </li>
                ))}
            </ul>

        </div>
    );

}