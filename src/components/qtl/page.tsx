import React, { useCallback, useState } from 'react';
import { Container, Header, Menu } from 'semantic-ui-react';

import { GenomicRange, QTLDataTableRow, SNPWithCoordinates, SNPWithQTL } from './types';
import { SNP_QUERY, SNP_AUTOCOMPLETE_QUERY, SNP_QUERY_BY_ID } from './queries';
import { Navbar } from '../navbar';
import { QTLDataTable } from './datatable';
import { Banner } from './banner';
import { WrappedBatchRegionOrSNPSearch } from 'genomic-file-upload';
import { Browser } from './browser';
import { associateBy } from 'queryz';
import { GeneEntry } from './browser/queries';

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

    const client = "https://ga.staging.wenglab.org/graphql"; // useContext(ClientContext);
    const [ rows, setRows ] = useState<QTLDataTableRow[] | null>(null);
    const [ page, setPage ] = useState(0);

    const loadBatch = useCallback( async (value: (GenomicRange | any)[]): Promise<QTLDataTableRow[]> => {
        const coordinates = value.filter(x => (x as GenomicRange).chromosome !== undefined);
        const ids = value.filter(x => (x as GenomicRange).chromosome === undefined); // .flatMap(x => [ ...x ]);
        return coordinates.length > 0 ? fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY,
                variables: { coordinates }
            })
        }).then(response => response.json() || { data: { snpQuery: [] }}).then(async (data: any) => {
            return [ data, ids.length + (data?.data.snpQuery || []).length > 0 ? await fetch(client, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: SNP_QUERY_BY_ID,
                    variables: {
                        snpids: [ ...ids, ...(data?.data.snpQuery || []) ].map((x: SNPWithQTL) => x.id),
                        gene_name_prefix: [ ...new Set((data?.data.snpQuery || []).flatMap( (x: SNPWithQTL) => x.gtex_eQTLs.map(x => x.gene_id.split(".")[0]) )) ]
                    }
                })
            }) : undefined ]
        }).then(async v => { console.log(v); return [ v[0], await v[1]?.json() || { data: { snpQuery: [], gene: [] }} ] }).then(async v => {
            let [ _, byIDs ] = v;
            byIDs = await byIDs;
            const geneCoordinates = associateBy(byIDs.data.gene || [], (x: GeneEntry) => x.id.split(".")[0], ((x: GeneEntry) => x.coordinates));
            const geneNames = associateBy(byIDs.data.gene || [], (x: GeneEntry) => x.id.split(".")[0], ((x: GeneEntry) => x.name));
            const results: QTLDataTableRow[] = [];
            byIDs.data.snpQuery.forEach( (x: SNPWithQTL) => {
                x.gtex_eQTLs.forEach( q => results.push({
                    ...q,
                    id: x.id,
                    coordinates: x.coordinates,
                    gene_coordinates: geneCoordinates.get(q.gene_id.split(".")[0]),
                    name: geneNames.get(q.gene_id.split(".")[0])
                }));
            });
            return results;
        }) : [];
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
                { rows !== null ? (
                    <Menu secondary pointing>
                        <Menu.Item onClick={() => setPage(0)} active={page === 0}>Table View</Menu.Item>
                        <Menu.Item onClick={() => setPage(1)} active={page === 1}>Browser View</Menu.Item>
                    </Menu>
                ) : null}
                { rows === null ? (
                    <WrappedBatchRegionOrSNPSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region or SNP ID to search for eQTLs:"
                        onError={error => { setRows([]); console.log(error); }}
                        getSuggestions={getSuggestions}
                        example={() => <em>example: chr1:1,051,700-1,061,800</em>}
                    />
                ) : page === 0 ? (
                    <>
                        <Header as="h3">Your search returned {rows.length} eQTL{rows.length !== 1 ? "s" : ""}:</Header>
                        <QTLDataTable
                            data={rows}
                        />
                    </>
                ) : (
                    <Browser
                        // domain={{ chromosome: "chr10", start: 6006376, end: 6726377 }}
                        // domain={{ chromosome: "chr4", start: 102606371, end: 102666372 }}
                        // domain={{ chromosome: "chr16", start: 11012144, end: 11132145 }}
                        // domain={{ chromosome: "chr3", start: 49605050, end: 49725051 }}
                        domain={{ chromosome: "chr21", start: 39004818, end: 39134818 }}
                        population="EUROPEAN"
                        rSquaredThreshold={0.1}
                        qtls={rows}
                    />
                )}
            </Container>
        </>
    );

};
export default QTLPage;
