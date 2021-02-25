import React from 'react';
import { DataTable, DataTableColumn } from "ts-ztable";
import "./styles.css";

import { QTLDataTableProps } from './types';
import { QTLDataTableRow } from "../types";

const COLUMNS: DataTableColumn<QTLDataTableRow>[] = [{
    header: "SNP",
    value: row => row.id
}, {
    header: "gene ID",
    value: row => row.gene_id
}, {
    header: "tissue",
    value: row => row.tissue,
    render: row => row.tissue.replace(/_/g, " ")
}, {
    header: "p-value",
    value: row => row.pval_nominal
}, {
    header: "q-value",
    value: row => row.pval_beta
}, {
    header: "slope",
    value: row => row.slope
}];

const QTLDataTable: React.FC<QTLDataTableProps> = props => (
    <DataTable
        rows={props.data}
        columns={COLUMNS}
        sortColumn={4}
        itemsPerPage={8}
        searchable
    />
);
export default QTLDataTable;
