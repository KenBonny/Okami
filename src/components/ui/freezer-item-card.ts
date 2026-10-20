import {Unit, type FreezerItem} from "../Models.ts";
import {createInput} from "./input.ts";
import {determineWarning, warningAccentBar} from "../DetermineWarning.ts";
import {config} from "../../config.ts";
import {createItemActionButton, createItemEditor} from "./item-editor.ts";

export interface FreezerItemCardOptions {
    item: FreezerItem;
    onDelete: (id: number) => void;
    onSave: (item: FreezerItem) => void;
}

function createField(label: string, value: string): HTMLDivElement {
    const field = document.createElement("div");
    const term = document.createElement("dt");
    term.className = "text-xs uppercase opacity-70";
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    field.append(term, detail);
    return field;
}

export function createFreezerItemCard(options: FreezerItemCardOptions): {
    root: HTMLDivElement;
    update: (item: FreezerItem) => void;
} {
    const editor = createItemEditor({...options, onChange: () => renderCard()});

    const editButton = createItemActionButton("edit", "p-3", () => editor.toggleEdit());
    const saveButton = createItemActionButton("save", "p-3", () => editor.save());
    const cancelButton = createItemActionButton("cancel", "p-3", () => editor.toggleEdit());
    const deleteButton = createItemActionButton("delete", "p-3", () => editor.remove());

    const card = document.createElement("div");
    card.className = "overflow-hidden rounded-lg border border-zinc-950/10 bg-white shadow-sm";

    function renderCard() {
        const {item, editedItem} = editor;
        const warning = determineWarning(item.expiration, new Date(), config.warnings);

        const body = document.createElement("div");
        body.className = `py-3 pr-3 pl-5 ${warning} ${warningAccentBar(warning)}`.trim();

        const footer = document.createElement("div");
        footer.className = "flex justify-between border-t border-zinc-950/10 bg-white";

        if (editor.editing) {
            const {root: descRoot, input: descInput} = createInput({
                name: "description",
                placeholder: "Description",
                value: editedItem.description,
            });
            descInput.setAttribute("aria-label", "Description");
            descInput.addEventListener("input", (e) => {
                editedItem.description = (e.target as HTMLInputElement).value;
            });

            const {root: notesRoot, input: notesInput} = createInput({
                name: "notes",
                placeholder: "Notes",
                value: editedItem.notes || "",
            });
            notesInput.setAttribute("aria-label", "Notes");
            notesInput.addEventListener("input", (e) => {
                editedItem.notes = (e.target as HTMLInputElement).value;
            });

            const {root: amountRoot, input: amountInput} = createInput({
                name: "amount",
                type: "number",
                value: String(editedItem.amount),
                min: "1",
            });
            amountInput.setAttribute("aria-label", "Amount");
            amountInput.addEventListener("input", (e) => {
                editedItem.amount = Number((e.target as HTMLInputElement).value);
            });

            const amountRow = document.createElement("div");
            amountRow.className = "flex items-center gap-2";
            const unit = document.createElement("span");
            unit.textContent = Unit[editedItem.unit];
            amountRow.append(amountRoot, unit);

            const fields = document.createElement("div");
            fields.className = "flex flex-col gap-2";
            fields.append(descRoot, notesRoot, amountRow);

            const details = document.createElement("dl");
            details.className = "mt-3 grid grid-cols-3 gap-x-3 text-sm";
            details.append(
                createField("Type", editedItem.type),
                createField("Frozen", editedItem.frozen.toLocaleDateString()),
                createField("Expires", editedItem.expiration.toLocaleDateString()),
            );

            body.append(fields, details);
            footer.append(saveButton, cancelButton);
        } else {
            const title = document.createElement("p");
            title.className = "p-0 font-semibold";
            title.textContent = item.description;
            body.append(title);

            if (item.notes) {
                const notes = document.createElement("p");
                notes.className = "p-0 text-sm italic opacity-70";
                notes.textContent = item.notes;
                body.append(notes);
            }

            const details = document.createElement("dl");
            details.className = "mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm";
            details.append(
                createField("Type", item.type),
                createField("Amount", `${item.amount} ${Unit[item.unit]}`),
                createField("Frozen", item.frozen.toLocaleDateString()),
                createField("Expires", item.expiration.toLocaleDateString()),
            );
            body.append(details);
            footer.append(editButton, deleteButton);
        }

        card.replaceChildren(body, footer);
    }

    renderCard();

    return {
        root: card,
        update: (newItem: FreezerItem) => editor.replace(newItem),
    };
}
