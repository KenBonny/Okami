import {Unit, type FreezerItem} from "../Models.ts";
import {createTableCell} from "./table.ts";
import {createInput} from "./input.ts";
import {determineWarning, warningAccentBar} from "../DetermineWarning.ts";
import {config} from "../../config.ts";
import {createItemActionButton, createItemEditor} from "./item-editor.ts";

export interface FreezerItemRowOptions {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onSave: (item: FreezerItem) => void;
}

export function createFreezerItemRow(options: FreezerItemRowOptions): {
    root: HTMLTableRowElement;
    update: (item: FreezerItem) => void;
} {
    const editor = createItemEditor({...options, onChange: () => renderRow()});

    const editButton = createItemActionButton("edit", "m-2", () => editor.toggleEdit());
    const saveButton = createItemActionButton("save", "m-2", () => editor.save());
    const deleteButton = createItemActionButton("delete", "m-2", () => editor.remove());

    const row = document.createElement("tr");

    function renderRow() {
        const {item, editedItem} = editor;
        const warning = determineWarning(item.expiration, new Date(), config.warnings);
        const warningCss = warning.toString();
        const firstCellCss = `${warningCss} ${warningAccentBar(warning)}`.trim();

        row.innerHTML = "";
        row.className = editor.editing ? "align-top" : "";

        if (editor.editing) {
            // Edit mode
            const actionCell = createTableCell(undefined, [saveButton]);

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

            const descriptionCell = createTableCell(firstCellCss, [descRoot, document.createElement("br"), notesRoot]);

            const typeCell = createTableCell(warningCss, [document.createTextNode(editedItem.type)]);

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

            const unitSpan = document.createElement("p");
            unitSpan.className = "basis-1/3";
            unitSpan.textContent = Unit[editedItem.unit];
            const amountFlex = document.createElement("div");
            amountFlex.className = "flex flex-nowrap items-center space-x-2";
            amountFlex.append(amountRoot, unitSpan);
            const amountCell = createTableCell(warningCss, [amountFlex]);

            const frozenCell = createTableCell(warningCss, [document.createTextNode(editedItem.frozen.toLocaleDateString())]);
            const expirationCell = createTableCell(warningCss, [document.createTextNode(editedItem.expiration.toLocaleDateString())]);

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

            const descriptionCell = createTableCell(firstCellCss, [descText, notesBr, notesSpan]);
            const typeCell = createTableCell(warningCss, [document.createTextNode(item.type)]);
            const amountCell = createTableCell(warningCss, [document.createTextNode(`${item.amount} ${Unit[item.unit]}`)]);
            const frozenCell = createTableCell(warningCss, [document.createTextNode(item.frozen.toLocaleDateString())]);
            const expirationCell = createTableCell(warningCss, [document.createTextNode(item.expiration.toLocaleDateString())]);
            const deleteCell = createTableCell(undefined, [deleteButton]);

            row.append(actionCell, descriptionCell, typeCell, amountCell, frozenCell, expirationCell, deleteCell);
        }
    }

    renderRow();

    return {
        root: row,
        update: (newItem: FreezerItem) => editor.replace(newItem),
    };
}
