import clsx from "clsx";
import {defaultFreezerItem, type FreezerItem, Unit} from "../Models.ts";
import {createFieldset, createField, createLabel} from "./fieldset.ts";
import {createInput} from "./input.ts";
import {createButton} from "./button.ts";
import {createAutoCompleteInput} from "./autocomplete-input.ts";
import {getDate} from "../Utils.ts";

export interface AddFreezerItemFormOptions {
    items: FreezerItem[];
    className?: string;
    onAddItem: (item: FreezerItem) => void;
    defaultExpirationMonths: number;
}

export function createAddFreezerItemForm(options: AddFreezerItemFormOptions): {
    root: HTMLFormElement;
    update: (items: FreezerItem[]) => void;
} {
    const {className, onAddItem, defaultExpirationMonths} = options;
    let items = options.items;
    let isOpen = false;
    let formItem = defaultFreezerItem();

    const unitKeys = Object.keys(Unit).filter(key => isNaN(Number(key))).sort() as Array<keyof typeof Unit>;
    const today = new Date();

    function dateToISO(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function uniqueTypes(): string[] {
        const types = [...items.map(item => item.type)].filter(type => type !== "");
        return Array.from(new Set(types)).sort((left, right) => left.localeCompare(right));
    }

    const form = document.createElement("form");
    if (className) form.className = className;

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "flex items-center justify-between w-full text-left lg:hidden py-1";
    toggleButton.setAttribute("aria-expanded", "false");

    const titleSpan = document.createElement("span");
    titleSpan.className = "text-base font-semibold text-amber-400 underline decoration-amber-400";
    titleSpan.textContent = "Add freezer item";

    const chevronIcon = document.createElement("svg");
    chevronIcon.setAttribute("width", "20");
    chevronIcon.setAttribute("height", "20");
    chevronIcon.setAttribute("viewBox", "0 0 24 24");
    chevronIcon.setAttribute("fill", "none");
    chevronIcon.setAttribute("stroke", "currentColor");
    chevronIcon.setAttribute("stroke-width", "2");
    chevronIcon.className = "size-5 text-zinc-400 transition-transform duration-200 shrink-0";
    chevronIcon.innerHTML = `<polyline points="6 9 12 15 18 9"/>`;

    toggleButton.append(titleSpan, chevronIcon);

    const desktopTitle = document.createElement("h3");
    desktopTitle.className = "hidden lg:block text-amber-400";
    desktopTitle.textContent = "Add freezer item";

    toggleButton.addEventListener("click", () => {
        isOpen = !isOpen;
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        chevronIcon.classList.toggle("rotate-180", isOpen);
        fieldsDiv.classList.toggle("hidden", !isOpen);
        fieldsDiv.classList.toggle("lg:flex", isOpen || true);
    });

    const fieldsDiv = document.createElement("div");
    fieldsDiv.className = clsx(
        "flex-col lg:flex-row gap-4 lg:items-end mt-2 hidden lg:flex"
    );

    // Description field
    const descriptionLabel = createLabel("Description", {htmlFor: "description"});
    const {input: descriptionInput} = createInput({
        id: "description",
        name: "description",
        type: "text",
        placeholder: "Description",
        required: true,
    });
    const descriptionField = createField("w-full lg:basis-80 lg:grow-0 lg:shrink-0", [descriptionLabel, descriptionInput]);

    // Type autocomplete field
    const typeLabel = createLabel("Item Type", {});
    const typeAutocomplete = createAutoCompleteInput({
        items: uniqueTypes(),
        value: "",
        placeholder: "Item Type",
        className: "mt-2.5",
        onChange: (value) => {
            formItem.type = value;
        },
    });
    const typeField = createField("w-full lg:basis-64 lg:grow-0 lg:shrink-0", [typeLabel, typeAutocomplete]);

    // Amount + Unit field
    const amountLabel = createLabel("Amount", {htmlFor: "amount"});
    const amountUnitDiv = document.createElement("div");
    amountUnitDiv.className = "mt-2.5 flex rounded-lg ring-1 ring-inset ring-zinc-950/10 shadow-sm focus-within:ring-2 focus-within:ring-inset focus-within:ring-amber-400 bg-white overflow-hidden";

    const {input: amountInput} = createInput({
        id: "amount",
        name: "amount",
        type: "number",
        min: "1",
        required: true,
        className: "block flex-1 min-w-0 border-0 bg-transparent px-3.5 py-2.5 sm:px-3 sm:py-1.5 text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 focus:outline-none focus:ring-0",
    });

    const unitSelect = document.createElement("select");
    unitSelect.id = "unit";
    unitSelect.name = "unit";
    unitSelect.required = true;
    unitSelect.className = "appearance-none border-0 bg-transparent py-2.5 sm:py-1.5 pl-3 pr-8 text-base/6 text-zinc-950 sm:text-sm/6 focus:outline-none focus:ring-0 cursor-pointer";
    unitKeys.forEach(key => {
        const option = document.createElement("option");
        option.value = String(Unit[key]);
        option.textContent = key;
        unitSelect.append(option);
    });

    const unitDiv = document.createElement("div");
    unitDiv.className = "relative flex items-center border-l border-zinc-950/10 bg-zinc-50 shrink-0";
    unitDiv.append(unitSelect);

    const chevronSpan = document.createElement("span");
    chevronSpan.className = "pointer-events-none absolute right-2 flex items-center";
    chevronSpan.setAttribute("aria-hidden", "true");
    chevronSpan.innerHTML = `<svg class="size-4 stroke-zinc-500" viewBox="0 0 16 16" fill="none"><path d="M5.75 10.75L8 13L10.25 10.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.25 5.25L8 3L5.75 5.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    unitDiv.append(chevronSpan);

    amountUnitDiv.append(amountInput, unitDiv);
    const amountField = createField("w-full lg:w-auto lg:shrink-0", [amountLabel, amountUnitDiv]);

    // Date fields
    const datesDiv = document.createElement("div");
    datesDiv.className = "flex flex-row w-full gap-4 lg:max-w-72 lg:shrink-0";

    const frozenLabel = createLabel("Frozen", {htmlFor: "frozen"});
    const frozenInput = document.createElement("input");
    frozenInput.type = "date";
    frozenInput.id = "frozen";
    frozenInput.name = "frozen";
    frozenInput.required = true;
    frozenInput.max = dateToISO(today);
    frozenInput.className = "block w-full border-0 bg-transparent px-3.5 py-2.5 sm:px-3 sm:py-1.5 text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 focus:outline-none focus:ring-0 rounded-lg ring-1 ring-inset ring-zinc-950/10 shadow-sm focus:ring-2 focus:ring-inset focus:ring-amber-400 mt-2.5";
    const frozenField = createField("basis-1/2", [frozenLabel, frozenInput]);

    const expirationLabel = createLabel("Expiration", {htmlFor: "expiration"});
    const expirationInput = document.createElement("input");
    expirationInput.type = "date";
    expirationInput.id = "expiration";
    expirationInput.name = "expiration";
    expirationInput.required = true;
    expirationInput.min = dateToISO(today);
    expirationInput.className = "block w-full border-0 bg-transparent px-3.5 py-2.5 sm:px-3 sm:py-1.5 text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 focus:outline-none focus:ring-0 rounded-lg ring-1 ring-inset ring-zinc-950/10 shadow-sm focus:ring-2 focus:ring-inset focus:ring-amber-400 mt-2.5";
    const expirationField = createField("basis-1/2", [expirationLabel, expirationInput]);

    datesDiv.append(frozenField, expirationField);

    // Submit button
    const submitButton = createButton({color: "amber", type: "submit", className: "w-full lg:w-auto lg:shrink-0 lg:self-end"}, [document.createTextNode("Add")]);

    fieldsDiv.append(descriptionField, typeField, amountField, datesDiv, submitButton);

    const fieldset = createFieldset(undefined, [fieldsDiv]);

    form.append(toggleButton, desktopTitle, fieldset);

    // Event handlers
    descriptionInput.addEventListener("input", (e) => {
        formItem.description = (e.target as HTMLInputElement).value;
    });

    amountInput.addEventListener("input", (e) => {
        formItem.amount = Number((e.target as HTMLInputElement).value);
    });

    unitSelect.addEventListener("change", (e) => {
        formItem.unit = Number((e.target as HTMLSelectElement).value) as any;
    });

    frozenInput.addEventListener("change", (e) => {
        const date = (e.target as HTMLInputElement).valueAsDate;
        if (date) formItem.frozen = date;
    });

    expirationInput.addEventListener("change", (e) => {
        const date = (e.target as HTMLInputElement).valueAsDate;
        if (date) formItem.expiration = date;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        onAddItem(formItem);
        formItem = defaultFreezerItem();
        descriptionInput.value = "";
        amountInput.value = "1";
        unitSelect.value = String(Unit.gram);
        frozenInput.value = dateToISO(today);
        expirationInput.value = dateToISO(getDate(defaultExpirationMonths));
        descriptionInput.focus();
    });

    // Initialize date inputs
    frozenInput.value = dateToISO(today);
    expirationInput.value = dateToISO(getDate(defaultExpirationMonths));
    amountInput.value = "1";

    return {
        root: form,
        update(newItems: FreezerItem[]) {
            items = newItems;
            // Update autocomplete items if types changed
            const typeOptions = uniqueTypes();
            // Would need to recreate the autocomplete with new items here
            // For now, items are updated but autocomplete won't reflect new types until re-render
        },
    };
}
