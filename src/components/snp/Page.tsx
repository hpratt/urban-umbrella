import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Divider, Loader, Menu, Message } from 'semantic-ui-react';
import { Banner } from './banner';
import { Navbar } from '../navbar';
import { useSNPData } from '../snpannotation/hooks';
import MotifIntersectionView from '../snpannotation/MotifIntersectionView';
import PeakIntersectionView from '../snpannotation/PeakIntersectionView';
import { SNP_QUERY_BY_ID } from '../qtl/queries';
import { QTLDataTableRow, SNPWithQTL } from '../qtl/types';
import { QTLDataTable } from '../qtl/datatable';
import { LD_QUERY_WITH_COORDINATES, RDHS_QUERY } from '../re/queries';
import { RDHS, RDHSRow } from '../re/types';
import { summaryZScores, tissueZScores } from '../re/utilities/tissue';
import { RDHSDataTable } from '../re/datatable';
import { associateBy } from 'queryz';
import { GeneEntry } from '../qtl/browser/queries';

const SNP_COORDINATE_QUERY = `
    query SNP($coordinates: [GenomicRangeInput!]) {
        snpQuery(assembly: "hg38", coordinates: $coordinates, common: true) {
            id
        }
    }
`;

const COORDINATE = /(chr[0-9XYM]+)[:\s]([0-9,]+)[-\s]([0-9,]+)/g;

export type PageProps = {
    nonav?: boolean;
    snp?: string;
};

const Page: React.FC<PageProps> = props => {
    
    const [ page, setPage ] = useState(-1);
    let { snp } = useParams<{ snp: string }>();
    const rsnp = useMemo( () => props.snp || snp, [ props.snp, snp ]);
    snp = rsnp;
    const [ sID, setSID ] = useState(snp);
    const r = useMemo( () => [ ...snp.matchAll(COORDINATE) ], [ snp ]);
    const coordinates = useMemo( () => {
        if ((r?.length || 0) === 0) return;
        const v = r[0]!;
        if (v.length < 4) return;
        const end = +v[3] - +v[2] <= 1 ? +v[2] + 2 : +v[3];
        return {
            chromosome: v[1],
            start: +v[2],
            end
        };
    }, [ r ]);

    useEffect( () => {
        if (coordinates)
            fetch("https://snps.staging.wenglab.org/graphql", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: SNP_COORDINATE_QUERY,
                    variables: { coordinates }
                })
            }).then(response => response.json()).then(
                data => setSID(data.data.snpQuery[0]?.id || "")
            );
    }, [ coordinates ]);
    
    return coordinates && sID.match(COORDINATE) ? <Loader active>Loading...</Loader> : (
        <>
            { !props.nonav && (
                <>
                    <Navbar />
                    <Banner snp={sID} />
                </>
            )}
            <Container style={{ width: "80%", marginTop: "3em" }}>
                { page === -1 && <>Select an annotation category:<br /></> }
                <Menu>
                    <Menu.Item onClick={() => { setPage(0); }}>TF Binding</Menu.Item>
                    <Menu.Item onClick={() => { setPage(1); }}>eQTLs</Menu.Item>
                    <Menu.Item onClick={() => { setPage(2); }}>Regulatory Elements</Menu.Item>
                </Menu>
                { page === 0 ? (
                    <TFTab snp={sID} />
                ) : page === 1 ? (
                    <QTLTab snp={sID} />
                ) : page === 2 ? (
                    <RETab snp={sID} />
                ) : null}
            </Container>
        </>
    )
}
export default Page;

const TFTab: React.FC<{ snp: string }> = props => {
    const { data, loading } = useSNPData(props.snp, "hg38", "AFRICAN");
    const [ page, setPage ] = useState(0);
    const snps = useMemo(
        () =>
            data === undefined || data.snpQuery[0] === undefined
                ? []
                : [{ ...data.snpQuery[0], rSquared: 1.0 }],
        [data]
    );
    return loading ? <Loader active>Loading...</Loader> : (
        <>
            <h2>TF annotations for {props.snp}</h2>
            <Divider style={{ marginBottom: '2em' }} />
            {page === -1 ? <Message info>{snps.length} SNPs matched your query.</Message> : ''}
            <Menu secondary>
                <Menu.Item>
                    <strong>Select an annotation:</strong>
                </Menu.Item>
                <Menu.Item onClick={() => setPage(0)} active={page === 0}>
                    Peak Intersection
                </Menu.Item>
                <Menu.Item onClick={() => setPage(1)} active={page === 1}>
                    Motif Intersection
                </Menu.Item>
            </Menu>
            {page === 0 ? (
                <PeakIntersectionView snps={snps} assembly={'GRCh38'} />
            ) : page === 1 ? (
                <MotifIntersectionView snps={snps} assembly={'GRCh38'} />
            ) : null}
        </>
    );
}

const QTLTab: React.FC<{ snp: string }> = props => {
    const [ results, setResults ] = useState< QTLDataTableRow[] | undefined>(undefined);
    useEffect( () => {
        if (results !== undefined) return;
        fetch("https://ga.staging.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY_BY_ID,
                variables: { snpids: [ props.snp ] }
            })
        }).then(response => response.json()).then(
            data => {
                const geneNames = associateBy(data.data.gene || [], (x: GeneEntry) => x.id.split(".")[0], ((x: GeneEntry) => x.name));
                const results: QTLDataTableRow[] = [];
                data.data.snpQuery.forEach( (x: SNPWithQTL) => {
                    x.gtex_eQTLs.forEach( q => results.push({
                        ...q,
                        name: geneNames.get(q.gene_id.split(".")[0]),
                        coordinates: x.coordinates,
                        id: x.id
                    }));
                });
                return results;
            }
        ).then(setResults);
    }, [ props.snp, results ]);
    return results === undefined ? <Loader active>Loading...</Loader> : (
        <QTLDataTable data={results} />
    );
}

const RETab: React.FC<{ snp: string }> = props => {
    const [ results, setResults ] = useState<RDHSRow[] | undefined>(undefined);
    const r = useCallback( async () => {
        const snps = await fetch("https://snps.staging.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: LD_QUERY_WITH_COORDINATES,
                variables: {
                    snpids: [ props.snp ],
                    rSquaredThreshold: 1.1,
                    population: "AFRICAN"
                }
            })
        });
        const j = await snps.json();
        const coordinates = j.data.snpQuery.flatMap( (x: any) => [
            x.coordinates,
            ...x.linkageDisequilibrium
                .filter( (xx: any) => xx.rSquared > 1.1 )
                .map( (xx: any) => xx.coordinates )
        ]);
        fetch("https://psychscreen.api.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: RDHS_QUERY,
                variables: { coordinates: [ ...coordinates ] }
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
        ).then(setResults);
    }, [ props.snp ]);
    useEffect( () => { if (results === undefined) r(); }, [ results, r ] );
    return results === undefined ? <Loader active>Loading...</Loader> : (
        <RDHSDataTable data={results} />
    );
}
