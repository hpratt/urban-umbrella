import React, { useEffect, useMemo, useState } from 'react';
import { expandRange } from 'jubilant-carnival';
import { Grid, Loader } from 'semantic-ui-react';
import { DataTable, DataTableColumn } from 'ts-ztable';
import { RDHS_QUERY } from '../queries';
import { NamedRegion, RDHS, RDHSRow } from '../types';
import { summaryZScores, tissueZScores } from '../utilities/tissue';
import RDHSBrowser from './browser';
import { RDHSBrowserPageProps } from './types';

const aStyle = {
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'arial, sans-serif',
    color: '#069',
    cursor: 'pointer',
    outline: 'none',
};

function COLUMNS(onClick: (region: NamedRegion) => void): DataTableColumn<NamedRegion>[] {
    return [{
        header: "Select a Region to View",
        value: row => `${row.region.chromosome}:${row.region.start}-${row.region.end} ${row.name !== "" ? "(" + row.name + ")" : ""}`,
        render: row => (
            <span style={aStyle} onClick={() => onClick(row)}>
                {row.region.chromosome}:{row.region.start}-{row.region.end} {row.name !== "" ? "(" + row.name + ")" : ""}
            </span>
        )
    }];
}

const RDHSBrowserPage: React.FC<RDHSBrowserPageProps> = props => {

    const [ rows, setRows ] = useState<RDHSRow[]>([]);
    const [ region, setRegion ] = useState(props.ranges[0]);
    const trueRegion = useMemo( () => region && region.region ? ({
        chromosome: region.region.chromosome,
        ...(region.region.end - region.region.start < 50000 ? expandRange(region.region, 50000) : region.region)
    }) : null, [ region ]);

    useEffect( () => {
        if (!trueRegion) return;
        fetch("https://psychscreen.api.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: RDHS_QUERY,
                variables: { coordinates: [ trueRegion || region.region ] }
            })
        }).then(response => response.json()).then(
            response => {
                setRows(
                    response.data.rDHSQuery.map( (x: RDHS) => ({
                        accession: x.accession,
                        coordinates: x.coordinates,
                        tissueZScores: tissueZScores(x.zScores),
                        summaryZScores: summaryZScores(x.zScores)
                    }))
                );
            }
        );
    }, [ region, trueRegion ]);

    return (
        <Grid>
            <Grid.Column width={4}>
                <DataTable columns={COLUMNS(setRegion)} rows={props.ranges} itemsPerPage={10} />
            </Grid.Column>
            <Grid.Column width={12}>
                { rows.length > 0 && trueRegion ? (
                    <RDHSBrowser
                        onDomainChanged={domain => setRegion({ region: domain, name: region.name })}
                        key={`${region.region.chromosome}:${region.region.start}-${region.region.end}`}
                        data={rows}
                        domain={trueRegion}
                        ldPreferences={props.ldPreferences}
                        anchor={region.name === "" ? undefined : region.name}
                    />
                ) : <Loader active>Loading...</Loader>}
            </Grid.Column>
        </Grid>
    )
};
export default RDHSBrowserPage;
