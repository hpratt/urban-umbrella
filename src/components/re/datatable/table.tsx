import React from 'react';
import { mean } from 'mathjs';
import { DataTable, DataTableColumn } from "ts-ztable";
import "./styles.css";

import { RDHSDataTableProps } from './types';
import { RDHSRow } from "../types";

const COLUMNS = (tissues: string[]): DataTableColumn<RDHSRow>[] => [{
    header: "accession",
    value: row => row.accession
}, {
    header: "coordinates (hg38)",
    value: row => `${row.coordinates.chromosome}:${row.coordinates.start}-${row.coordinates.end}`
}, ...tissues.map( (tissue: string): DataTableColumn<RDHSRow> => ({
    header: tissue,
    value: row => {
        const values = (row.tissueZScores.get(tissue) || []).map(x => x === -10 ? -4 : x);
        return values.length < 1 ? -10.0 : (values.length === 1 ? values[0] : mean(values)).toFixed(2);
    },
    render: row => {
        const values = (row.tissueZScores.get(tissue) || []).map(x => x === -10 ? -4 : x);
        const m = values.length < 1 ? -10.0 : (values.length === 1 ? values[0] : mean(values)).toFixed(2);
        return (
            <span style={{ fontWeight: m > 1.64 ? "bold" : "normal", color: m > 1.64 ? "#06da93" : "#8c8c8c" }}>
                {values.length < 1 ? "--" : m}
            </span>
        )
    }
})).slice(0, 12)];

const RDHSDataTable: React.FC<RDHSDataTableProps> = props => {
    const columns = COLUMNS([ ...(props.data[0]?.tissueZScores.keys() || []) ]);
    return (
        <DataTable
            rows={props.data}
            columns={columns}
            sortColumn={columns.length > 2 ? 2 : 1}
            itemsPerPage={8}
            searchable
        />
    );
};
export default RDHSDataTable;
