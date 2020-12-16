import React, { useMemo } from 'react';
import { associateBy } from 'queryz';
import { GenomeBrowser, DenseBigBed, StackedTracks, WrappedTrack, WrappedRulerTrack } from 'umms-gb';
import { mean } from 'mathjs';

import { RDHSBrowserProps } from './types';

const RDHSBrowser: React.FC<RDHSBrowserProps> = props => {

    const tissues = useMemo( () => [ ...(props.data[0]?.tissueZScores.keys() || []) ], [ props.data ]);
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

    return (
        <GenomeBrowser
            innerWidth={1000}
            width={1000}
            domain={props.domain}
        >
            <StackedTracks id="main">
                <WrappedRulerTrack domain={props.domain} height={50} title="coordinates" titleSize={12} width={1000} id="ruler" />
                { tissues.map( tissue => (
                    <WrappedTrack width={1000} height={50} title={tissue} id={tissue} titleSize={12}>
                        <DenseBigBed domain={props.domain} width={1000} height={25} data={data.get(tissue)!} />
                    </WrappedTrack>
                ))}
            </StackedTracks>
        </GenomeBrowser>
    );

};
export default RDHSBrowser;
