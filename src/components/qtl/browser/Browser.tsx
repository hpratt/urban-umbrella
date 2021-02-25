import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Header } from 'semantic-ui-react';
import { GenomeBrowser, GraphQLTrackSet, GraphQLTranscriptTrack, LDData, ManhattanTrack, WrappedFullBigWig, WrappedLDTrack, WrappedRulerTrack, WrappedSquishTranscriptTrack, WrappedTrack } from 'umms-gb';
import { FileDataLoader, BigWigReader } from "bigwig-reader";

import { GenomicRange } from '../types';
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { LDEntry, LDQueryResponse, LD_QUERY } from './queries';
import { associateBy } from 'queryz';
import { ClientContext } from '../../../App';
import { ManhattanSNP, SummaryStatisticSNP } from 'umms-gb/dist/components/tracks/manhattan/types';

export type QTLBrowserViewProps = {
    domain: GenomicRange;
    onDomainChanged?: (domain: GenomicRange) => void;
    population: string;
    subpopulation?: string;
    rSquaredThreshold: number;
};

const Tooltip: React.FC<ManhattanSNP> = snp => (
    <div style={{ background: "#ffffff88" }}>
        <Header as="h4">{snp.data.rsId}</Header>
        {snp.data.score.toExponential(3)}
    </div>
);

const QTLBrowserView: React.FC<QTLBrowserViewProps> = props => {

    const fileInput = useRef<HTMLInputElement>(null);
    const [ bigBed, setFile ] = useState<BigWigReader | null>(null);
    const [ inView, setInView ] = useState<SummaryStatisticSNP[]>([]);
    const [ anchor, setAnchor ] = useState("");
    const mclient = useContext(ClientContext);
    const client = useMemo( () => new ApolloClient({ uri: mclient, cache: new InMemoryCache() }), [ mclient ]);
    const ref = useRef<SVGSVGElement>(null);

    console.log(anchor);

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
    console.log(data);
    const ldMap = useMemo<Map<string, LDEntry[]>>( () => associateBy(data?.snpQuery || [], x => x.id, x => x.linkageDisequilibrium), [ data ])
    const snps = useMemo( () => inView.map( x => ({ id: x.rsId, domain: x.coordinates })), [ inView ]);
    const snpData = useMemo<LDData>( () => ({
        snps,
        ld: ldMap.get(anchor) || []
    }), [ snps, ldMap, anchor ]);

    const referenceTrack = useMemo( () => ({
        url: "gs://data.genomealmanac.org/public/ATAC.aggregated.bigWig",
        chr1: props.domain.chromosome,
        start: props.domain.start,
        end: props.domain.end
    }), [ props ]);

    const onFileChange = useCallback( (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.files && setFile(new BigWigReader(new FileDataLoader(e.target.files[0])));
    }, []);

    return (
        <>
            <Button primary onClick={() => fileInput && fileInput.current && fileInput.current.click()}>
                Upload Summary Statistics
            </Button>
            <input type="file" name="file" hidden ref={fileInput} onChange={onFileChange} multiple />
            <GenomeBrowser
                svgRef={ref}
                innerWidth={1200}
                width="95%"
                domain={props.domain}
                onDomainChanged={x => { props.onDomainChanged && props.onDomainChanged({ start: x.start, end: x.end, chromosome: x.chromosome! }); }}
            >
                <WrappedRulerTrack domain={props.domain} height={40} title="coordinates (hg38)" titleSize={9} width={1200} id="ruler" />
                <WrappedTrack width={1200} height={150} id="" titleSize={12} title="Summary Statistics">
                    <ManhattanTrack
                        height={150}
                        data={inView}
                        width={1200}
                        domain={props.domain}
                        onSNPMousedOver={snp => setAnchor(snp.data.rsId)}
                        svgRef={ref}
                        tooltipContent={Tooltip}
                    />
                </WrappedTrack>
                <WrappedLDTrack
                    titleSize={9}
                    trackMargin={12}
                    height={100}
                    domain={props.domain}
                    width={1200}
                    id="LD"
                    title={`SNPs with Linkage Disequilibrium (${props.population})`}
                    data={snpData}
                    anchor={anchor}
                    ldThreshold={0.1}
                    onVariantClick={(snp: { id: string }) => setAnchor(snp.id)}
                />
                <GraphQLTranscriptTrack endpoint="https://ga.staging.wenglab.org/graphql" assembly="GRCh38" id="tx" domain={props.domain} transform="">
                    <WrappedSquishTranscriptTrack trackMargin={20} rowHeight={16} width={1200} domain={props.domain} id="tx1" color="#880000" title="GENCODE v24 transcripts" titleSize={9} />
                </GraphQLTranscriptTrack>
                <GraphQLTrackSet tracks={[ referenceTrack ]} id="graphql" transform="" width={1200} endpoint="https://ga.staging.wenglab.org/graphql">
                    <WrappedFullBigWig title="average reference brain ATAC-seq signal" height={80} color="#06da93" width={1200} domain={props.domain} id="bw" titleSize={9} />
                </GraphQLTrackSet>
            </GenomeBrowser>
        </>
    )

};
export default QTLBrowserView;
