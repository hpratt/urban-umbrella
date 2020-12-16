import React, { useCallback, useMemo, useState } from 'react';
import { associateBy } from 'queryz';
import { GenomeBrowser, DenseBigBed, WrappedTrack, WrappedRulerTrack, GraphQLTrackSet, WrappedFullBigWig, GraphQLTranscriptTrack, WrappedSquishTranscriptTrack, GraphQLLDTrack, WrappedLDTrack } from 'umms-gb';
import { mean } from 'mathjs';
import { Button, Checkbox, Icon, Modal } from 'semantic-ui-react';

import { RDHSBrowserProps } from './types';
import { TISSUE_MAP } from '../utilities';

const RDHSBrowser: React.FC<RDHSBrowserProps> = props => {

    const sortedTissues = useMemo( () => [ ...TISSUE_MAP.keys() ].sort(), []);
    const tissues = useMemo( () => [ ...(props.data[0]?.tissueZScores.keys() || []) ], [ props.data ]);
    const summaryTissues = useMemo( () => [ ...(props.data[0]?.summaryZScores.keys() || []) ], [ props.data ]);
    const [ shown, setShown ] = useState(associateBy(sortedTissues, x => x, x => false));
    const [ modalShown, setModalShown ] = useState(false);
    const [ anchor, setAnchor ] = useState(props.anchor);
    const toggleShown = useCallback( (i: string) => {
        const nShown = new Map([ ...shown ]);
        nShown.set(i, !nShown.get(i)!);
        setShown(nShown);
    }, [ shown ]);

    const data = useMemo( () => (
        associateBy(
            tissues,
            x => x,
            x => props.data.map( d => ({
                start: d.coordinates.start,
                end: d.coordinates.end,
                name: d.accession,
                score: mean(d.tissueZScores.get(x) || [ -10.0 ]),
                color: mean(d.tissueZScores.get(x) || [ -10.0 ]) > 1.64 ? "#06da93" : "#8c8c8c"
            }))
        )
    ), [props, tissues]);
    const summaryData = useMemo( () => (
        associateBy(
            summaryTissues,
            x => x,
            x => props.data.map( d => ({
                start: d.coordinates.start,
                end: d.coordinates.end,
                name: d.accession,
                score: mean(d.summaryZScores.get(x) || [ -10.0 ]),
                color: mean(d.summaryZScores.get(x) || [ -10.0 ]) > 1.64 ? "#06da93" : "#8c8c8c"
            }))
        )
    ), [props, summaryTissues]);

    const referenceTrack = useMemo( () => ({
        url: "gs://data.genomealmanac.org/public/ATAC.aggregated.bigWig",
        chr1: props.domain.chromosome,
        start: props.domain.start,
        end: props.domain.end
    }), [ props ]);

    return (
        <>
            <Button onClick={() => setModalShown(true)} size="mini"><Icon name="chart area" />Add Tracks</Button><br /> <br />
            <GenomeBrowser
                innerWidth={1200}
                width="95%"
                domain={props.domain}
            >
                <WrappedRulerTrack domain={props.domain} height={40} title="coordinates" titleSize={9} width={1200} id="ruler" />
                <GraphQLLDTrack
                    domain={props.domain}
                    width={1200}
                    transform=""
                    id="hg38_ldtrack"
                    population={[ props.ldPreferences.population ]}
                    anchor={anchor || "rs141121886"}
                    assembly="hg38"
                    endpoint="https://snps.staging.wenglab.org/graphql"
                >
                    <WrappedLDTrack
                        titleSize={9}
                        trackMargin={12}
                        height={100}
                        domain={props.domain}
                        width={1200}
                        id="LD"
                        title={`SNPs with Linkage Disequilibrium (${props.ldPreferences.population})`}
                        onVariantClick={(snp: { rsId: string }) => { setAnchor(snp.rsId) }}
                    />
                </GraphQLLDTrack>
                <GraphQLTranscriptTrack endpoint="https://ga.staging.wenglab.org/graphql" assembly="GRCh38" id="tx" domain={props.domain} transform="">
                    <WrappedSquishTranscriptTrack trackMargin={20} rowHeight={16} width={1200} domain={props.domain} id="tx1" color="#880000" title="GENCODE v24 transcripts" titleSize={9} />
                </GraphQLTranscriptTrack>
                { summaryTissues.map( tissue => (
                    <WrappedTrack width={1200} height={30} title={tissue} id={tissue} titleSize={9}>
                        <DenseBigBed domain={props.domain} width={1200} height={25} data={summaryData.get(tissue)!} />
                    </WrappedTrack>
                ))}
                { tissues.map( tissue => shown.get(tissue.split(" ")[0]) ? (
                    <WrappedTrack width={1200} height={30} title={TISSUE_MAP.get(tissue.split(" ")[0]) + ' ' + tissue.split(" ")[1]} id={tissue} titleSize={9}>
                        <DenseBigBed domain={props.domain} width={1200} height={25} data={data.get(tissue)!} />
                    </WrappedTrack>
                ) : null)}
                <GraphQLTrackSet tracks={[ referenceTrack ]} id="graphql" transform="" width={1200} endpoint="https://ga.staging.wenglab.org/graphql">
                    <WrappedFullBigWig title="average reference brain ATAC-seq signal" height={80} color="#06da93" width={1200} domain={props.domain} id="bw" titleSize={9} />
                </GraphQLTrackSet>
            </GenomeBrowser><br />
            <Modal open={modalShown}>
                <Modal.Header>Select Region-Specific Tracks</Modal.Header>
                <Modal.Content>
                    { sortedTissues.map( (x, i) => (
                        <React.Fragment key={x}>
                            <Checkbox onChange={() => toggleShown(x)} label={TISSUE_MAP.get(x) || x} /><br />
                        </React.Fragment>
                    ))}
                </Modal.Content>
                <Modal.Actions><Button onClick={() => setModalShown(false)}>OK</Button></Modal.Actions>
            </Modal>
        </>
    );

};
export default RDHSBrowser;
