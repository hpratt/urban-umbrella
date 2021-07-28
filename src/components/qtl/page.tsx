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

const PSC_REGIONS = [
    { chromosome: "chr19", start: 47703205, end: 49703205 },
    { chromosome: "chr2", start: 110175424, end: 112175424 },
    { chromosome: "chr4", start: 9715315, end: 11715315 },
    { chromosome: "chr11", start: 110709215, end: 112709215 },
    { chromosome: "chr4", start: 101657480, end: 103657480 },
    { chromosome: "chr19", start: 45702450, end: 47702450 },
    { chromosome: "chr16", start: 2723109, end: 4723109 },
    { chromosome: "chr3", start: 154089424, end: 156089424 },
    { chromosome: "chr13", start: 39220445, end: 41220445 },
    { chromosome: "chr10", start: 131544853, end: 133544853 },
    { chromosome: "chr21", start: 38094818, end: 40094818 },
    { chromosome: "chr16", start: 67908687, end: 69908687 },
    { chromosome: "chr6", start: 136913152, end: 138913152 },
    { chromosome: "chr21", start: 41434957, end: 43434957 },
    { chromosome: "chr15", start: 78975159, end: 80975159 },
    { chromosome: "chr3", start: 48684099, end: 50684099 },
    { chromosome: "chr17", start: 48208404, end: 50208404 },
    { chromosome: "chr2", start: 202747335, end: 204747335 },
    { chromosome: "chr22", start: 23914162, end: 25914162 },
    { chromosome: "chr3", start: 70473942, end: 72473942 },
    { chromosome: "chr6", start: 89320722, end: 91320722 },
    { chromosome: "chr3", start: 70104739, end: 72104739 },
    { chromosome: "chr18", start: 68876452, end: 70876452 },
    { chromosome: "chr11", start: 63340263, end: 65340263 },
    { chromosome: "chr1", start: 1595307, end: 3595307 },
    { chromosome: "chr16", start: 10075826, end: 12075826 },
    { chromosome: "chr10", start: 5066476, end: 7066476 },
    { chromosome: "chr4", start: 121578590, end: 123578590 },
    { chromosome: "chr12", start: 110446804, end: 112446804 },
];

const QTLPage: React.FC = () => {

    const client = "https://ga.staging.wenglab.org/graphql"; // useContext(ClientContext);
    const [ rows, setRows ] = useState<QTLDataTableRow[] | null>(null);
    const [ page, setPage ] = useState(0);
    const [ domain, setDomain ] = useState(PSC_REGIONS[3]);

    const loadBatch = useCallback( async (value: (GenomicRange | any)[]): Promise<QTLDataTableRow[]> => {
        const coordinates = value.filter(x => (x as GenomicRange).chromosome !== undefined);
        let v = value.filter( x => (x as GenomicRange).chromosome === undefined );
        if (typeof v[0] !== "string") v = [ ...(v[0] as unknown as Set<string>) ];
        const ids = typeof v[0] === "string" ? v.map( x => ({ id: x })) : [];
        return (coordinates.length > 0 ? fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY,
                variables: { coordinates }
            })
        }) : new Promise(
            r => r({ json: () => ({ data: { snpQuery: [] }}) })
        )).then(response => (response as any).json() || { data: { snpQuery: [] }}).then(async (data: any) => {
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
        }).then(async v => ([ v[0], await v[1]?.json() || { data: { snpQuery: [], gene: [] }} ] )).then(async v => {
            let [ _, byIDs ] = v;
            byIDs = await byIDs;
            const genes = [ ...(byIDs?.data?.gene || []), ...(v[0]?.data?.gene || []) ];
            const geneCoordinates = associateBy(genes, (x: GeneEntry) => x.id.split(".")[0], ((x: GeneEntry) => x.coordinates));
            const geneNames = associateBy(genes, (x: GeneEntry) => x.id.split(".")[0], ((x: GeneEntry) => x.name));
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
    console.log(domain);

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
                        domain={domain}
                        onDomainChanged={setDomain}
                        // domain={{ chromosome: "chr4", start: 101606371, end: 103666372 }}
                        // domain={{ chromosome: "chr16", start: 10512144, end: 11632145 }}
                        // domain={{ chromosome: "chr3", start: 47605050, end: 51725051 }}
                        // domain={{ chromosome: "chr21", start: 36894818, end: 39444818 }}
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
