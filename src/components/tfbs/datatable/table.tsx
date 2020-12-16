import React from 'react';
import { DNALogo } from "logojs-react";
import { DataTable, DataTableColumn } from "ts-ztable";
import "ts-ztable/src/styles.css";

import { TFBSDataTableProps } from './types';
import { TFBS } from "../types";

const COLUMNS: DataTableColumn<TFBS>[] = [{
    header: "motif",
    render: row => <DNALogo ppm={row.motif.pwm} />,
    value: () => 0
}, {
    header: "q-value",
    value: row => row.q_value
}, {
    header: "chromosome",
    value: row => row.genomic_region.chromosome
}, {
    header: "start",
    value: row => row.genomic_region.start,
    render: row => row.genomic_region.start.toLocaleString()
}, {
    header: "end",
    value: row => row.genomic_region.end,
    render: row => row.genomic_region.end.toLocaleString()
}, {
    header: "strand",
    value: row => row.strand
}];

const TFBSDataTable: React.FC<TFBSDataTableProps> = props => (
    <DataTable
        rows={props.data}
        columns={COLUMNS}
        sortColumn={4}
        itemsPerPage={8}
        searchable
    />
);
export default TFBSDataTable;
