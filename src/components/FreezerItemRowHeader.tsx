import {type FreezerField, SortDirection} from "./sortFreezerItemsReducer.ts";
import type {ReactElement} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDownShortWide, faArrowUpWideShort, faUpDown} from "@fortawesome/free-solid-svg-icons";
import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";

export interface FreezerItemRowHeaderProperties {
    field: FreezerField;
    sortField: FreezerField;
    sortDirection: SortDirection;
    children: string | ReactElement | ReactElement[];
    onClick: (field: FreezerField) => void;
}

export default function FreezerItemRowHeader({field, sortField, sortDirection, children, onClick}: FreezerItemRowHeaderProperties) {
    const icon: IconDefinition = field !== sortField
        ? faUpDown
        : sortDirection === SortDirection.ascending
            ? faArrowDownShortWide
            : faArrowUpWideShort;

    return (
        <th onClick={() => onClick(field)}>
            {children} <FontAwesomeIcon icon={icon} />
        </th>
    );
}