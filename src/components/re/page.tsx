import React, { useCallback, useState } from 'react';
import { Container, Header, Menu } from 'semantic-ui-react';
import { WrappedBatchRegionOrSNPSearch } from 'genomic-file-upload';

import { NamedRegion, RDHS, RDHSRow } from './types';
import { RDHS_QUERY } from './queries';
import { Navbar } from '../navbar';
import { RDHSDataTable } from './datatable';
import { Banner } from './banner';
import { GenomicRange } from 'genomic-file-upload/dist/utilities/types';
import { summaryZScores, tissueZScores } from './utilities/tissue';
import RDHSBrowserPage from './browser/page';
import { Example } from '../ld/ld';
import { LD_QUERY_WITH_COORDINATES } from './queries';
import { Link } from 'react-router-dom';

function expand(c: GenomicRange, e: number): GenomicRange {
    return {
        chromosome: c.chromosome,
        start: c.start - e,
        end: c.end + e
    };
}

const RDHSPage: React.FC = () => {

    const [ rows, setRows ] = useState<RDHSRow[] | null>(null);
    const [ regions, setRegions ] = useState<NamedRegion[]>([]);
    const [ page, setPage ] = useState(0);
    const [ ldPreferences, setLDPreferences ] = useState({
        using: false,
        rSquared: 0.7,
        population: "EUR"
    });

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
            ...j.data.snpQuery.map((x: any) => ({ region: expand(x.coordinates, 100000), name: x.rsId }))
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
                    />
                ) : (
                    <>
                        <Menu secondary pointing>
                            <Menu.Item onClick={() => setPage(0)} active={page === 0}>Genome Browser View</Menu.Item>
                            <Menu.Item onClick={() => setPage(1)} active={page === 1}>Table View</Menu.Item>
                        </Menu>
                        <Header as="h3">Your search returned {rows.length} regulatory element{rows.length !== 1 ? "s" : ""}:</Header>
                        { page === 0 ? (
                            <RDHSBrowserPage data={rows} ranges={regions} ldPreferences={ldPreferences} />
                        ) : page === 1 ? (
                            <RDHSDataTable
                                data={rows}
                            />
                        ) : null}
                    </>
                )}
            </Container>
        </>
    );

};
export default RDHSPage;
