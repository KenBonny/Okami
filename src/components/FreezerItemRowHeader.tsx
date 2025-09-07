import {type FreezerField, SortDirection} from "./sortFreezerItemsReducer.ts";
import type {ReactElement} from "react";
import {TableHeader} from "./tailwind/table.tsx";
import clsx from "clsx";
import {ArrowsUpDownIcon, BarsArrowDownIcon, BarsArrowUpIcon} from "@heroicons/react/24/solid";

export interface FreezerItemRowHeaderProperties {
    className?: string | undefined;
    field: FreezerField;
    sortField: FreezerField;
    sortDirection: SortDirection;
    children: string | ReactElement | ReactElement[];
    onClick: (field: FreezerField) => void;
}

export default function FreezerItemRowHeader({className, field, sortField, sortDirection, children, onClick}: FreezerItemRowHeaderProperties) {
    const isSortingField = field === sortField;
    const color = isSortingField ? "text-amber-400" : "text-zinc-300"
    const css = `size-6 ${color}`

    const icon = !isSortingField
        ? <ArrowsUpDownIcon className={css} />
        : (sortDirection === SortDirection.ascending
            ? <BarsArrowDownIcon className={css} />
            : <BarsArrowUpIcon className={css} />);


    return (
        <TableHeader className={clsx(className, "text-black")}
                     onClick={() => onClick(field)}>
            <div className="flex items-center gap-2">
                {icon}
                {children}
            </div>
        </TableHeader>
    );
}