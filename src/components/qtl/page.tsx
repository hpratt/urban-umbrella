import React, { useContext, useCallback, useState } from 'react';
import { Container, Header } from 'semantic-ui-react';

import { ClientContext } from '../../App';
import { GenomicRange, QTLDataTableRow, SNPWithCoordinates, SNPWithQTL } from './types';
import { SNP_QUERY, SNP_AUTOCOMPLETE_QUERY, SNP_QUERY_BY_ID } from './queries';
import { Navbar } from '../navbar';
import { QTLDataTable } from './datatable';
import { Banner } from './banner';
import { WrappedBatchRegionOrSNPSearch } from 'genomic-file-upload';

function parseCoordinate(match: RegExpMatchArray | null, field: string): number {
    const value = match?.groups && match.groups[field];
    return value ? +value.replace(',', '') : -1;
}

export function matchIsGenomicCoordinate(match: RegExpMatchArray | null): boolean {
    const start = parseCoordinate(match, 'start');
    const end = parseCoordinate(match, 'end');
    return (
        match !== null &&
        match.groups !== undefined &&
        match.groups.chromosome !== undefined &&
        match.groups.start !== undefined &&
        match.groups.end !== undefined &&
        !isNaN(start) &&
        start > 0 &&
        !isNaN(end) &&
        end > 0
    );
}

export function matchGenomicRegion(region: string): RegExpMatchArray | null {
    return /(?<chromosome>[A-Za-z0-9_]+)[:\t ](?<start>[0-9]+)[-\t ](?<end>[0-9]+)/g.exec(region.replace(/,/g, ''));
}

const QTLPage: React.FC = () => {

    const client = useContext(ClientContext);
    const [ rows, setRows ] = useState<QTLDataTableRow[] | null>(null);

    const loadBatch = useCallback( async (value: (GenomicRange | any)[]): Promise<QTLDataTableRow[]> => {
        const coordinates = value.filter(x => (x as GenomicRange).chromosome !== undefined);
        const ids = value.filter(x => (x as GenomicRange).chromosome === undefined); // .flatMap(x => [ ...x ]);
        const byCoordinates = coordinates.length > 0 ? fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY,
                variables: { coordinates }
            })
        }).then(response => response.json()) : { data: { snpQuery: [] }};
        const byIDs = ids.length > 0 ? fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY_BY_ID,
                variables: { snpids: ids }
            })
        }).then(response => response.json()) : { data: { snpQuery: [] }};
        return Promise.all([ byCoordinates, byIDs ])
            .then( response => {
                const results: QTLDataTableRow[] = [];
                response[0].data.snpQuery.forEach( (x: SNPWithQTL) => {
                    x.gtex_eQTLs.forEach( q => results.push({
                        ...q,
                        snp: x.id
                    }));
                });
                response[1].data.snpQuery.forEach( (x: SNPWithQTL) => {
                    x.gtex_eQTLs.forEach( q => results.push({
                        ...q,
                        snp: x.id
                    }));
                });
                return results;
            });
    }, [ client ]);

    const getSuggestions = useCallback(async (_: any, d: any): Promise<any[] | Record<string, any> | undefined> => {
        return fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_AUTOCOMPLETE_QUERY,
                variables: { snpid: d.value }
            })
        }).then(response => response.json()).then(
            response => {
                const results: any[] = response.data.snpAutocompleteQuery.map( (x: SNPWithCoordinates) => ({
                    title: x.id,
                    description: `${x.coordinates.chromosome}:${x.coordinates.start.toLocaleString()}-${x.coordinates.end.toLocaleString()}`
                })).slice(0, 3);
                if (matchIsGenomicCoordinate(matchGenomicRegion(d.value)))
                    results.push({ title: d.value, description: "genomic coordinates (GRCh38 assembly)" });
                else if (results.length === 0)
                    results.push({ title: d.value, description: "(no suggestions)" });
                return results;
            }
        )
    }, [ client ]);

    return (
        <>
            <Navbar />
            <Banner />
            <Container style={{ marginTop: "3em" }}>
                { rows === null ? (
                    <WrappedBatchRegionOrSNPSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region or SNP ID to search for eQTLs:"
                        onError={error => { setRows([]); console.log(error); }}
                        getSuggestions={getSuggestions}
                        example={() => <em>example: chr1:1,051,700-1,061,800</em>}
                    />
                ) : (
                    <>
                        <Header as="h3">Your search returned {rows.length} eQTL{rows.length !== 1 ? "s" : ""}:</Header>
                        <QTLDataTable
                            data={rows}
                        />
                    </>
                )}
            </Container>
        </>
    );

};
export default QTLPage;
