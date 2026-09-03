import type {FreezerItem, Unit} from "../Models.ts";
import {createTableCell, createTableRow} from "./table.ts";
import {createInput} from "./input.ts";
import {determineWarning} from "../DetermineWarning.ts";
import {config} from "../../config.ts";

export interface FreezerItemRowOptions {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onSave: (item: FreezerItem) => void;
}

export function createFreezerItemRow(options: FreezerItemRowOptions): {
    root: HTMLTableRowElement;
    update: (item: FreezerItem) => void;
} {
    let {item, onDelete, onSave} = options;
    let editing = false;
    let editedItem = {...item};

    const warningCss = determineWarning(item.expiration, new Date(), config.warnings).toString();

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "m-2 text-amber-400 cursor-pointer";
    editButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    `;

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "m-2 text-green-700 cursor-pointer";
    saveButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
    `;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "m-2 text-red-600 cursor-pointer";
    deleteButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
    `;

    editButton.addEventListener("click", () => toggleEdit());
    saveButton.addEventListener("click", () => save());
    deleteButton.addEventListener("click", () => onDelete(item.id));

    function toggleEdit() {
        editing = !editing;
        editedItem = {...item};
        renderRow();
    }

    function save() {
        editing = false;
        item = editedItem;
        onSave(editedItem);
        renderRow();
    }

    function dateToISO(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const row = document.createElement("tr");

    function renderRow() {
        row.innerHTML = "";
        row.className = warningCss;

        if (editing) {
            // Edit mode
            const actionCell = createTableCell(undefined, [editButton === editButton ? saveButton : editButton]);

            const {root: descRoot, input: descInput} = createInput({
                id: "description",
                name: "description",
                placeholder: "Description",
                value: editedItem.description,
                className: "min-w-32 max-w-64",
            });

            const {root: notesRoot, input: notesInput} = createInput({
                id: "notes",
                name: "notes",
                placeholder: "Notes",
                value: editedItem.notes || "",
                className: "min-w-32 max-w-64",
            });

            descInput.addEventListener("input", (e) => {
                editedItem.description = (e.target as HTMLInputElement).value;
            });

            notesInput.addEventListener("input", (e) => {
                editedItem.notes = (e.target as HTMLInputElement).value;
            });

            const descriptionCell = createTableCell(undefined, [descRoot, document.createElement("br"), notesRoot]);

            const typeCell = createTableCell(undefined, [document.createTextNode(editedItem.type)]);

            const {root: amountRoot, input: amountInput} = createInput({
                id: "amount",
                name: "amount",
                type: "number",
                value: String(editedItem.amount),
                min: "1",
                className: "basis-2/3",
            });

            amountInput.addEventListener("input", (e) => {
                editedItem.amount = Number((e.target as HTMLInputElement).value);
            });

            const amountCell = document.createElement("td");
            amountCell.className = "relative px-4 py-4 first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) sm:first:pl-1 sm:last:pr-1 border-b border-zinc-950/5 dark:border-white/5 flex flex-nowrap items-center space-x-2";
            amountCell.append(amountRoot);
            const unitSpan = document.createElement("p");
            unitSpan.className = "basis-1/3";
            unitSpan.textContent = String(editedItem.unit);
            amountCell.append(unitSpan);

            const frozenCell = createTableCell(undefined, [document.createTextNode(editedItem.frozen.toLocaleDateString())]);
            const expirationCell = createTableCell(undefined, [document.createTextNode(editedItem.expiration.toLocaleDateString())]);

            row.append(actionCell, descriptionCell, typeCell, amountCell, frozenCell, expirationCell, createTableCell(undefined, []));
        } else {
            // View mode
            const actionCell = createTableCell(undefined, [editButton]);

            const descText = document.createElement("span");
            descText.textContent = item.description;
            const notesBr = document.createElement("br");
            const notesSpan = document.createElement("span");
            notesSpan.className = "italic text-sm text-zinc-400";
            notesSpan.textContent = item.notes || "";

            const descriptionCell = createTableCell(undefined, [descText, notesBr, notesSpan]);
            const typeCell = createTableCell(undefined, [document.createTextNode(item.type)]);
            const amountCell = createTableCell(undefined, [document.createTextNode(`${item.amount} ${item.unit}`)]);
            const frozenCell = createTableCell(undefined, [document.createTextNode(item.frozen.toLocaleDateString())]);
            const expirationCell = createTableCell(undefined, [document.createTextNode(item.expiration.toLocaleDateString())]);
            const deleteCell = createTableCell(undefined, [deleteButton]);

            row.append(actionCell, descriptionCell, typeCell, amountCell, frozenCell, expirationCell, deleteCell);
        }
    }

    renderRow();

    return {
        root: row,
        update(newItem: FreezerItem) {
            item = newItem;
            editedItem = {...newItem};
            editing = false;
            renderRow();
        },
    };
}
