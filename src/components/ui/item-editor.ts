import type {FreezerItem} from "../Models.ts";

export interface ItemEditorOptions {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onSave: (item: FreezerItem) => void;
    onChange: () => void;
}

export interface ItemEditor {
    readonly item: FreezerItem;
    readonly editedItem: FreezerItem;
    readonly editing: boolean;
    toggleEdit: () => void;
    save: () => void;
    remove: () => void;
    replace: (item: FreezerItem) => void;
}

export function createItemEditor(options: ItemEditorOptions): ItemEditor {
    const {onDelete, onSave, onChange} = options;
    let item = options.item;
    let editing = false;
    let editedItem = {...item};

    return {
        get item() { return item; },
        get editedItem() { return editedItem; },
        get editing() { return editing; },
        toggleEdit() {
            editing = !editing;
            editedItem = {...item};
            onChange();
        },
        save() {
            editing = false;
            item = editedItem;
            onSave(editedItem);
            onChange();
        },
        remove() {
            onDelete(item.id);
        },
        replace(newItem: FreezerItem) {
            item = newItem;
            editedItem = {...newItem};
            editing = false;
            onChange();
        },
    };
}

export type ItemActionKind = "edit" | "save" | "cancel" | "delete";

const icons: Record<ItemActionKind, {color: string; label: string; svg: string}> = {
    edit: {
        color: "text-amber-400",
        label: "Edit",
        svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>`,
    },
    save: {
        color: "text-green-700",
        label: "Save",
        svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>`,
    },
    cancel: {
        color: "text-zinc-500",
        label: "Cancel",
        svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="6" y1="6" x2="18" y2="18"/>
            <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>`,
    },
    delete: {
        color: "text-red-600",
        label: "Delete",
        svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>`,
    },
};

export function createItemActionButton(kind: ItemActionKind, className: string, onClick: () => void): HTMLButtonElement {
    const {color, label, svg} = icons[kind];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${className} ${color} cursor-pointer`;
    button.setAttribute("aria-label", label);
    button.innerHTML = svg;
    button.addEventListener("click", onClick);
    return button;
}
