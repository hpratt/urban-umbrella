import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Header, Modal } from 'semantic-ui-react';
import { GenomeBrowser, GraphQLLDTrack, GraphQLTrackSet, GraphQLTranscriptTrack, Link, LinkTrack, ManhattanTrack, WrappedFullBigWig, WrappedLDTrack, WrappedRulerTrack, WrappedSquishTranscriptTrack, WrappedTrack } from 'umms-gb';
import { FileDataLoader, BigWigReader } from "bigwig-reader";

import { GenomicRange, QTLDataTableRow } from '../types';
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { LDQueryResponse, LD_QUERY } from './queries';
import { associateBy, groupBy } from 'queryz';
import { ManhattanSNP, SummaryStatisticSNP } from 'umms-gb/dist/components/tracks/manhattan/types';
import SNPDetails from '../../snp/Page';

export type QTLBrowserViewProps = {
    domain: GenomicRange;
    onDomainChanged?: (domain: GenomicRange) => void;
    population: string;
    subpopulation?: string;
    rSquaredThreshold: number;
    qtls: QTLDataTableRow[];
};

function link(row: QTLDataTableRow): Link {
    return {
        regionA: row.gene_coordinates!,
        regionB: row.snp_coordinates!,
        score: -Math.log10(row.pval_beta)
    };
}

const POPULATIONS = [
    { population: "EUROPEAN", subpopulation: "IBERIAN" },
    { population: "EUROPEAN", subpopulation: "BRITISH" },
    { population: "EUROPEAN", subpopulation: "FINNISH" },
    { population: "EUROPEAN", subpopulation: "TOSCANI" },
    { population: "EUROPEAN", subpopulation: "UTAH_RESIDENT_NW_EUROPEAN" }
];

const QTLBrowserView: React.FC<QTLBrowserViewProps> = props => {

    const fileInput = useRef<HTMLInputElement>(null);
    const [ bigBed, setFile ] = useState<BigWigReader | null>(null);
    const [ inView, setInView ] = useState<SummaryStatisticSNP[]>([]);
    const [ anchor, setAnchor ] = useState("");
    const client = useMemo( () => new ApolloClient({ uri: "https://ga.staging.wenglab.org/graphql", cache: new InMemoryCache() }), []);
    const ref = useRef<SVGSVGElement>(null);
    const [ modal, setModal ] = useState(false);

    useEffect( () => {
        bigBed?.readBigBedData(props.domain.chromosome, props.domain.start, props.domain.chromosome, props.domain.end).then(
            x => setInView(x.map(xx => ({
                rsId: xx.name?.split("_")[1] || "",
                score: Math.pow(10, -(+(xx.name?.split("_")[0] || "0"))),
                coordinates: {
                    start: xx.start,
                    end: xx.end,
                    chromosome: xx.chr
                }
            })))
        )
    }, [ bigBed, props ]);

    const { data } = useQuery<LDQueryResponse>(LD_QUERY, {
        variables: {
            snpids: inView.map( x => x.rsId ),
            population: props.population,
            subpopulation: props.subpopulation,
            rSquaredThreshold: props.rSquaredThreshold
        },
        client
    });

    const referenceTrack = useMemo( () => ({
        url: "gs://data.genomealmanac.org/public/ATAC.aggregated.bigWig",
        chr1: props.domain.chromosome,
        start: props.domain.start,
        end: props.domain.end
    }), [ props ]);

    const onFileChange = useCallback( (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.files && setFile(new BigWigReader(new FileDataLoader(e.target.files[0])));
    }, []);

    const snpCoordinates = useMemo( () => associateBy([ ...(data?.snpQuery || []), ...(props.qtls) ], x => x.id, x => x.coordinates), [ data, props ]);
    const groupedQTLs = useMemo( () => (
        groupBy(
            props.qtls.filter(x => x.gene_coordinates && snpCoordinates.get(x.id)), // QTLs for which we have coordinates
            x => x.tissue,
            x => ({ ...x, gene_coordinates: x.gene_coordinates, snp_coordinates: snpCoordinates.get(x.id)! })
        )
    ), [ props, snpCoordinates ]);
    const snpGroupedQTLs = useMemo( () => (
        new Map([ ...groupedQTLs.keys() ].map( k => [ k, groupBy(groupedQTLs.get(k)!, x => x.id, x => x) ]))
    ), [ groupedQTLs ]);
    
    const Tooltip: React.FC<ManhattanSNP> = useCallback(snp => (
        <div style={{ background: "#ffffffbb" }}>
            <Header as="h4">{snp.data.rsId}</Header>
            <strong>p-value</strong>: {snp.data.score.toExponential(3)}<br /><br />
            { [ ...(snpGroupedQTLs.keys() || []) ].map(k => (
                snpGroupedQTLs.get(k)!.get(snp.data.rsId) || []).map(x => (
                    <React.Fragment key={`${k}_${x.gene_id}`}>
                        <strong>{x.name || x.gene_id}</strong><br /> {x.pval_nominal.toExponential(3)}<br /><br />
                    </React.Fragment>
                ))
            )}
        </div>
    ), [ snpGroupedQTLs ]);

    const zoomOut = useCallback( (factor: number) => {
        const width = (props.domain.end - props.domain.start) * factor;
        const m = (props.domain.end + props.domain.start) / 2;
        props.onDomainChanged && props.onDomainChanged({
            ...props.domain,
            start: Math.floor(m - width / 2),
            end: Math.ceil(m + width / 2)
        });
    }, [ props.domain ]);

    return (
        <>
            <Modal open={modal} style={{ width: "90%" }}>
                <Modal.Header>Details for {anchor}</Modal.Header>
                <Modal.Content>
                    <SNPDetails snp={anchor} nonav />
                </Modal.Content>
                <Modal.Actions><Button onClick={() => setModal(false)}>Close</Button></Modal.Actions>
            </Modal>
            <Button primary onClick={() => fileInput && fileInput.current && fileInput.current.click()}>
                Upload Summary Statistics
            </Button>
            <input type="file" name="file" hidden ref={fileInput} onChange={onFileChange} multiple />
            <Button onClick={ () => zoomOut(3) }>Zoom Out 3x</Button>
            <Button onClick={ () => zoomOut(0.3) }>Zoom In 3x</Button>
            <GenomeBrowser
                svgRef={ref}
                innerWidth={1200}
                width="95%"
                domain={props.domain}
                onDomainChanged={x => { props.onDomainChanged && props.onDomainChanged({ start: x.start, end: x.end, chromosome: props.domain.chromosome }); }}
            >
                <WrappedRulerTrack domain={props.domain} height={40} title="coordinates (hg38)" titleSize={9} width={1200} id="ruler" />
                <GraphQLLDTrack
                    domain={props.domain}
                    width={1200}
                    transform=""
                    id="hg38_ldtrack"
                    populations={POPULATIONS}
                    assembly="hg38"
                    anchor={anchor}
                    endpoint="https://snps.staging.wenglab.org/graphql"
                >
                    { POPULATIONS.map( p => (
                        <WrappedLDTrack
                            titleSize={9}
                            trackMargin={12}
                            height={100}
                            domain={props.domain}
                            width={1200}
                            id="LD"
                            title={`SNPs with Linkage Disequilibrium (${p.subpopulation})`}                            
                            anchor={anchor}
                            ldThreshold={0.1}
                            onVariantClick={(snp: { id: string }) => { setAnchor(snp.id); setModal(true); }}
                        />
                    ))}
                </GraphQLLDTrack>
                <WrappedTrack width={1200} height={150} id="" titleSize={12} title="Summary Statistics">
                    <ManhattanTrack
                        width={1200}
                        height={150}
                        domain={props.domain}
                        onSNPMousedOver={snp => setAnchor(snp.data.rsId)}
                        svgRef={ref}
                        tooltipContent={Tooltip}
                        data={inView}
                        onSNPClick={() => setModal(true)}
                    />
                </WrappedTrack>
                <GraphQLTranscriptTrack endpoint="https://ga.staging.wenglab.org/graphql" assembly="GRCh38" id="tx" domain={props.domain} transform="">
                    <WrappedSquishTranscriptTrack trackMargin={20} rowHeight={16} width={1200} domain={props.domain} id="tx1" color="#880000" title="GENCODE v24 transcripts" titleSize={9} />
                </GraphQLTranscriptTrack>
                <GraphQLTrackSet tracks={[ referenceTrack ]} id="graphql" transform="" width={1200} endpoint="https://ga.staging.wenglab.org/graphql">
                    <WrappedFullBigWig title="average reference brain ATAC-seq signal" height={80} color="#06da93" width={1200} domain={props.domain} id="bw" titleSize={9} />
                </GraphQLTrackSet>
                { [ ...groupedQTLs.keys() ].map( k => (
                    <WrappedTrack width={1200} height={50} id="" titleSize={12} title={`GTEx QTLs in ${k}`}>
                        <LinkTrack
                            width={1200}
                            height={50}
                            data={(anchor ? snpGroupedQTLs.get(k)!.get(anchor)?.map(link) || [] : groupedQTLs.get(k)!.map(link)).filter(x => x.score > 10)}
                            domain={props.domain}
                        />
                    </WrappedTrack>
                ))}
            </GenomeBrowser>
        </>
    )

};
export default QTLBrowserView;
