import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Container, Grid, Header, Icon, Menu, Message } from 'semantic-ui-react';
import { WrappedBatchRegionOrSNPSearch } from 'genomic-file-upload';

import { ClientContext } from '../../App';
import { NamedRegion, RDHS, RDHSRow } from './types';
import { RDHS_QUERY } from './queries';
import { Navbar } from '../navbar';
import { RDHSDataTable } from './datatable';
import { Banner } from './banner';
import { GenomicRange } from 'genomic-file-upload/dist/utilities/types';
import { summaryZScores, tissueZScores, TISSUE_MAP } from './utilities/tissue';
import RDHSBrowserPage from './browser/page';
import { Example } from '../ld/ld';
import { LD_QUERY_WITH_COORDINATES } from './queries';
import { Link } from 'react-router-dom';
import { SNP_AUTOCOMPLETE_QUERY } from '../qtl/queries';
import { SNPWithCoordinates } from '../qtl/types';
import { matchGenomicRegion, matchIsGenomicCoordinate } from '../qtl/page';
import { SearchModal } from './searchmodals';
import { mean } from 'mathjs';

function expand(c: GenomicRange, e: number): GenomicRange {
    return {
        chromosome: c.chromosome,
        start: c.start - e,
        end: c.end + e
    };
}

function gValue(entry: number[]) {
    const values = entry.map(x => x === -10 ? -4 : x);
    return values.length < 1 ? -10.0 : (values.length === 1 ? values[0] : mean(values));
}

const RDHSPage: React.FC = () => {

    const client = useContext(ClientContext);
    const [ rows, setRows ] = useState<RDHSRow[] | null>(null);
    const [ searchRegions, setSearchRegions ] = useState<Set<string> | null>(null);
    const [ regions, setRegions ] = useState<NamedRegion[]>([]);
    const [ page, setPage ] = useState(0);
    const [ ldPreferences, setLDPreferences ] = useState({
        using: false,
        rSquared: 0.7,
        population: "EUROPEAN"
    });

    const filterByTissue = useCallback( (r: RDHSRow): boolean => (
        searchRegions === null || searchRegions.size === 0 ? true : (
            Math.max(...[ ...searchRegions].map(x => gValue(r.tissueZScores.get(x + " NeuN-") || []))) > 1.64 || 
                Math.max(...[ ...searchRegions].map(x => gValue(r.tissueZScores.get(x + " NeuN+") || []))) > 1.64
        )
    ), [ searchRegions ]);
    const filtered = useMemo( () => (rows || []).filter(filterByTissue), [ rows, filterByTissue ] );

    const loadBatch = useCallback( async (values: (GenomicRange | string)[]): Promise<RDHSRow[]> => {
        const v = values.filter( x => (x as GenomicRange).chromosome === undefined );
        const s = typeof v[0] === "string" ? v : [];
        const snps = await fetch("https://snps.staging.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: LD_QUERY_WITH_COORDINATES,
                variables: {
                    snpids: s,
                    rSquaredThreshold: ldPreferences.using ? ldPreferences.rSquared : 1.1,
                    population: ldPreferences.population
                }
            })
        });
        const j = await snps.json();
        setRegions([
            ...regions,
            ...values.filter(x => (x as GenomicRange).chromosome !== undefined).map(x => ({ region: x as GenomicRange, name: "" })),
            ...j.data.snpQuery.map((x: any) => ({ region: expand(x.coordinates, 100000), name: x.id }))
        ]);
        const coordinates = j.data.snpQuery.flatMap( (x: any) => [
            x.coordinates,
            ...x.linkageDisequilibrium
                .filter( (xx: any) => xx.rSquared > (ldPreferences.using ? ldPreferences.rSquared : 1.1) )
                .map( (xx: any) => xx.coordinates )
        ]);
        return fetch("https://psychscreen.api.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: RDHS_QUERY,
                variables: { coordinates: [ ...coordinates, ...values.filter(x => (x as GenomicRange).chromosome !== undefined) ] }
            })
        }).then(response => response.json()).then(
            response => {
                return response.data.rDHSQuery.map( (x: RDHS) => ({
                    accession: x.accession,
                    coordinates: x.coordinates,
                    tissueZScores: tissueZScores(x.zScores),
                    summaryZScores: summaryZScores(x.zScores)
                }));
            }
        );
    }, [ ldPreferences, regions ]);

    const getSuggestions = useCallback(async (e: any, d: any): Promise<any[] | Record<string, any> | undefined> => {
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
                    results.push({ title: d.value, description: "genomic coordinates (hg38)" });
                else if (results.length === 0)
                    results.push({ title: d.value, description: "(no suggestions)" });
                return results;
            }
        )
    }, [ client ]);

    return (
        <>
            <Navbar>
                <Menu.Item as={Link} onClick={() => { setRows(null); setRegions([]); }}>
                    Regulatory Elements
                </Menu.Item>
            </Navbar>
            <Banner />
            <Container style={{ marginTop: "3em", width: rows === null ? undefined : "95%" }}>
                { rows === null ? (
                    <WrappedBatchRegionOrSNPSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region to search for regulatory elements:"
                        onError={error => { setRows([]); console.log(error); }}
                        example={Example({ onLDPreferencesChanged: setLDPreferences, ldPreferences })}
                        getSuggestions={getSuggestions}
                    />
                ) : searchRegions === null ? (
                    <SearchModal
                        onCancel={() => setSearchRegions(new Set([]))}
                        onAccept={regions => { setSearchRegions(regions); setPage(1); }}
                    />
                ) : (
                    <>
                        <Menu secondary pointing>
                            <Menu.Item onClick={() => setPage(0)} active={page === 0}>Genome Browser View</Menu.Item>
                            <Menu.Item onClick={() => setPage(1)} active={page === 1}>Table View</Menu.Item>
                        </Menu>
                        <Header as="h3">There are {rows.length} regulatory element{rows.length !== 1 ? "s" : ""} in the region(s) you searched:</Header>
                        { page === 0 ? (
                            <RDHSBrowserPage data={rows} ranges={regions} ldPreferences={ldPreferences} />
                        ) : page === 1 ? (
                            <>
                                { searchRegions.size ? (
                                    <Message info>
                                        <Grid>
                                            <Grid.Column width={1}><Icon name="info circle" /></Grid.Column>
                                            <Grid.Column width={14}>
                                                <strong>
                                                    We found {filtered.length} regulatory elements active in at least one of the following brain regions
                                                    you selected:&nbsp;
                                                </strong>
                                                {[ ...searchRegions ].sort().map(x => TISSUE_MAP.get(x)).filter(x => !!x).join(", ") }<br />
                                                <a href="#" onClick={() => setSearchRegions(new Set([]))}>Clear brain region filters »</a>
                                            </Grid.Column>
                                        </Grid>
                                    </Message>
                                ) : null}
                                <RDHSDataTable data={filtered} />
                            </>
                        ) : null}
                    </>
                )}
            </Container>
        </>
    );

};
export default RDHSPage;
