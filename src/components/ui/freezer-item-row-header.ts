import clsx from "clsx";
import type {FreezerField, SortDirection} from "../SortFreezerItemsReducer.ts";

export interface FreezerItemRowHeaderOptions {
    field: FreezerField;
    sortField: FreezerField;
    sortDirection: SortDirection;
    className?: string;
    label: string;
    onClick: (field: FreezerField) => void;
}

export function createFreezerItemRowHeader(options: FreezerItemRowHeaderOptions): {
    root: HTMLTableCellElement;
    update: (sortField: FreezerField, sortDirection: SortDirection) => void;
} {
    const {field, sortField, sortDirection, className, label, onClick} = options;

    const th = document.createElement("th");
    th.className = clsx(
        className,
        "border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) sm:first:pl-1 sm:last:pr-1 dark:border-b-white/10",
        "text-black cursor-pointer"
    );

    const div = document.createElement("div");
    div.className = "flex items-center gap-2";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;

    div.append(svg, labelSpan);
    th.append(div);
    th.addEventListener("click", () => onClick(field));

    function applyIcon(currentSortField: FreezerField, currentSortDirection: SortDirection) {
        const active = field === currentSortField;
        svg.setAttribute("class", `size-6 ${active ? "text-amber-400" : "text-zinc-300"}`);
        if (!active) {
            svg.innerHTML = `<path d="M12 5v14M19 12l-7 7-7-7M19 12l-7-7-7 7"/>`;
        } else if (currentSortDirection === "ascending") {
            svg.innerHTML = `<path d="M3 6h18M3 12h18M3 18h18M6 15l6 6 6-6"/>`;
        } else {
            svg.innerHTML = `<path d="M3 6h18M3 12h18M3 18h18M6 9l6-6 6 6"/>`;
        }
    }

    applyIcon(sortField, sortDirection);

    return {
        root: th,
        update: applyIcon,
    };
}
