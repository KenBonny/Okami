import clsx from "clsx";

export interface DateInputOptions {
    id?: string;
    name?: string;
    className?: string;
    value?: Date;
    min?: Date;
    max?: Date;
    required?: boolean;
    onChange?: (date: Date | null) => void;
}

export function createDateInput(options: DateInputOptions): HTMLInputElement {
    const {id, name, className, value, min, max, required, onChange} = options;

    const input = document.createElement("input");
    input.type = "date";
    if (id) input.id = id;
    if (name) input.name = name;
    input.className = clsx(
        className,
        "block w-full border-0 bg-transparent",
        "px-3.5 py-2.5 sm:px-3 sm:py-1.5",
        "text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6",
        "focus:outline-none focus:ring-0",
        "rounded-lg ring-1 ring-inset ring-zinc-950/10 shadow-sm",
        "focus:ring-2 focus:ring-inset focus:ring-amber-400"
    );
    if (required) input.required = true;

    if (value) input.valueAsDate = value;
    if (min) input.min = dateToISO(min);
    if (max) input.max = dateToISO(max);

    if (onChange) {
        input.addEventListener("change", () => {
            const date = input.valueAsDate;
            onChange(date);
        });
    }

    return input;
}

function dateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
