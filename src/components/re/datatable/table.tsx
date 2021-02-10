import React from 'react';
import { mean } from 'mathjs';
import { DataTable, DataTableColumn } from "ts-ztable";
import "./styles.css";

import { RDHSDataTableProps } from './types';
import { RDHSRow } from "../types";
import { TISSUE_MAP } from '../utilities/tissue';
import { Grid, Icon, Message, Popup } from 'semantic-ui-react';

const COLUMNS = (tissues: string[]): DataTableColumn<RDHSRow>[] => [{
    header: "accession",
    value: row => row.accession
}, {
    header: "coordinates (hg38)",
    value: row => `${row.coordinates.chromosome}:${row.coordinates.start}-${row.coordinates.end}`
}, ...tissues.map( (tissue: string): DataTableColumn<RDHSRow> => ({
    header: (
        <Popup
            content={<span>{TISSUE_MAP.get(tissue.split(" ")[0])} {tissue.split(" ")[1]}<br />(click to sort)</span>}
            trigger={<span>{tissue}</span>}
        />
    ),
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
        );
    }
})).slice(0, 12)];

const RDHSDataTable: React.FC<RDHSDataTableProps> = props => { 
    const columns = COLUMNS([ ...(props.data[0]?.tissueZScores.keys() || []) ]);
    return (
        <>
            <DataTable
                rows={props.data}
                columns={columns}
                sortColumn={columns.length > 2 ? 2 : 1}
                itemsPerPage={8}
                searchable
            />
            <Message info>
                <Grid>
                    <Grid.Column width={1}><Icon name="info circle" /></Grid.Column>
                    <Grid.Column width={14}>
                        The values displayed in this table are Z-score-normalized ATAC-seq signal values at each regulatory element
                        in a number of brain regions. We highlight elements with a Z-score &gt;1.64 (95th percentile) as being active
                        in the given tissue. Mouse over a column header for an explanation of the acronyms used. Click column headers
                        to sort the table.
                    </Grid.Column>
                </Grid>
            </Message>
        </>
    );
};
export default RDHSDataTable;
