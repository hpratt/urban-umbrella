import React, { useContext, useCallback, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { UploadWithRegionSearchBox, BatchedRegionSearch, BedMerger } from 'genomic-file-upload';
import { inflate } from "pako";

import { ClientContext } from '../../App';
import { GenomicRange, QTLDataTableRow, SNPWithQTL } from './types';
import { SNP_QUERY } from './queries';
import { Navbar } from '../navbar';
import { QTLDataTable } from './datatable';

export function readBed(file: File, onComplete: (regions: GenomicRange[]) => void, onError: (error: any) => void) {
    const textReader = new FileReader();
    const loadBinary = () => {
        const binaryReader = new FileReader();
        binaryReader.onload = e => {
            try {
                e.target && onComplete(parseBedContents((new TextDecoder()).decode(inflate(e.target.result as string))));
            } catch (e) {
                onError(e);
            }
        };
        binaryReader.readAsBinaryString(file);
        binaryReader.onerror = onError;
    };
    textReader.onload = e => {
        try {
            const newRegions = e.target ? parseBedContents(e.target.result as string) : [];
            if (newRegions.length > 0) onComplete(newRegions); else loadBinary();
        } catch (e) {
            loadBinary();
        }
    };
    textReader.onerror = loadBinary;
    textReader.readAsText(file);
}

export function mergeRegions(regions: GenomicRange[]): GenomicRange[] {
    if (regions.length <= 1) return regions;
    regions.sort( (a, b) => (
        a.chromosome < b.chromosome ? -1 : a.chromosome > b.chromosome ? 1 : a.start - b.start
    ));
    const results = [ regions[0] ];
    for (let i = 1; i < regions.length; ++i) {
        if (
            regions[i].chromosome === results[results.length - 1].chromosome &&
            regions[i].start <= results[results.length - 1].end
        ) {
            if (regions[i].end > results[results.length - 1].end) results[results.length - 1].end = regions[i].end;
        } else results.push(regions[i]);
    }
    return results;
}

function parseCoordinate(match: RegExpMatchArray | null, field: string): number {
    const value = match?.groups && match.groups[field];
    return value ? +value.replace(",", "") : -1;
}

export function matchIsGenomicCoordinate(match: RegExpMatchArray | null): boolean {
    const start = parseCoordinate(match, "start");
    const end = parseCoordinate(match, "end");
    return match !== null && match.groups !== undefined && match.groups.chromosome !== undefined &&
        match.groups.start !== undefined && match.groups.end !== undefined &&
        !isNaN(start) && start > 0 && !isNaN(end) && end > 0;
}

export function matchGenomicRegion(region: string): RegExpMatchArray | null {
    return /(?<chromosome>[A-Za-z0-9_]+)[:\t ](?<start>[0-9,]+)[-\t ](?<end>[0-9,]+)/g.exec(region);
}

export function matchBedLine(line: string): RegExpMatchArray | null {
    return /(?<chromosome>[A-Za-z0-9_]+)\t(?<start>[0-9,]+)\t(?<end>[0-9,]+)/g.exec(line);
}

function parseRegionGeneric(region: string, matchFunction: (region: string) => RegExpMatchArray | null): GenomicRange {
    const match = matchFunction(region);
    if (!matchIsGenomicCoordinate(match))
        throw new Error(`${region} could not be interpreted as a valid genomic coordinate`);
    return {
        chromosome: match?.groups!.chromosome!,
        start: parseCoordinate(match, "start"),
        end: parseCoordinate(match, "end")
    };
}

export function parseRegion(region: string): GenomicRange {
    return parseRegionGeneric(region, matchGenomicRegion);
}

export function parseBedLine(region: string): GenomicRange | null {
    try {
        return parseRegionGeneric(region, matchBedLine);
    } catch (e) {
        return null;
    }
}

export function isValidRegion(region: string): boolean {
    return matchIsGenomicCoordinate(matchGenomicRegion(region));
}

export function parseBedContents(text: string): GenomicRange[] {
    return text.split("\n").map(parseBedLine).filter( x => x !== null ).map( x => x! );
}

const QTLPage: React.FC = () => {

    const client = useContext(ClientContext);
    const [ files, setFiles ] = useState<FileList | null>(null);
    const [ regions, setRegions ] = useState<GenomicRange[] | null>(null);
    const [ rows, setRows ] = useState<QTLDataTableRow[] | null>(null);

    console.log(files && [ ...files ]);
    console.log(regions);

    if (files && files[0]) readBed(files[0], regions => console.log("!!!!", regions), console.log);

    const loadBatch = useCallback( async (coordinates: GenomicRange[]): Promise<QTLDataTableRow[]> => {
        return fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY,
                variables: { coordinates }
            })
        }).then(response => response.json()).then(
            response => {
                const results: QTLDataTableRow[] = [];
                response.data.snpQuery.forEach( (x: SNPWithQTL) => {
                    x.gtex_eQTLs.forEach( q => results.push({
                        ...q,
                        snp: x.rsId
                    }));
                });
                return results;
            }
        );
    }, [ client ]);

    return (
        <>
            <Navbar>

            </Navbar>
            <Container style={{ marginTop: "6em" }}>
                { files === null && regions === null ? (
                    <UploadWithRegionSearchBox
                        onFilesReceived={setFiles}
                        onRegionSubmitted={region => setRegions([ region ])}
                        title="Enter a region to search for GTEx eQTLs"
                    />
                ) : (
                    regions === null ? (
                        <BedMerger
                            files={[ ...files ]}
                            onComplete={regions => { console.log("!", regions); setRegions(regions); }}
                        />
                    ) : rows === null ? (
                        <BatchedRegionSearch
                            getResults={loadBatch}
                            regions={regions}
                            onComplete={setRows}
                            onError={console.log}
                        />
                    ) : (
                        <QTLDataTable
                            data={rows}
                        />
                    )
                )}
            </Container>
        </>
    );

};
export default QTLPage;
