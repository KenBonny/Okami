import {AddFreezerItemForm} from "./addFreezerItemForm.tsx";
import React, {useEffect, useState} from "react";
import {type FreezerItem, type User} from "./models.ts";
import {SearchFreezerItems} from "./searchFreezerItems.tsx";
import FreezerItemRow from "./freezerItemRow.tsx";
import GoogleAuth from "./GoogleAuth.tsx";

export const FreezerManager: React.FC = () => {
    const [freezerItems, setFreezerItems] = useState<FreezerItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<FreezerItem[]>([]);
    const [user, setUser] = React.useState<User | null>(null);

    useEffect(() => {
        if (user === null) return;

        console.log("save freezer items to Google drive")
    }, [freezerItems]);

    const handleAddItem = (newItem: FreezerItem) => {
        const ids = freezerItems.map(item => item.id);
        const nextId = Math.max(...ids, 0) + 1;
        setFreezerItems(prev => [...prev, {...newItem, id: nextId}]);
    };

    function handleDelete(id: number) {
        const deleted = freezerItems.find(item => item.id === id);
        if (!deleted || deleted.isDeleted) return;

        setFreezerItems(prev => [...(prev.filter(item => item !== deleted)), {
            ...deleted,
            isDeleted: true,
            deletedOn: new Date()
        }]);
    }

    function handleSave(updatedItem: FreezerItem) {
        setFreezerItems(prev =>
            prev.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            )
        );
    }

    const sortedItems = [...filteredItems].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    function loadFreezerItems(user: User) {
        setUser(user);
        console.log(`Loading Freezer items for: ${user.name}`);
    }

    function logout() {
        setUser(null);
    }

    return (
        <div>
            <GoogleAuth onSuccess={loadFreezerItems}  onLogout={logout} />
            <AddFreezerItemForm onAddItem={handleAddItem} />
            <hr />
            <SearchFreezerItems items={freezerItems} onSearch={items => setFilteredItems(items)} />
            <table>
                <thead>
                <tr>
                    <th></th>
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
                    <FreezerItemRow item={item} key={item.id} onDelete={handleDelete} onSave={handleSave} />))}
                </tbody>
            </table>
        </div>
    );

}