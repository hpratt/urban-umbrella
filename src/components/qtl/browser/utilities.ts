import { SummaryStatisticSNP } from 'umms-gb/dist/components/tracks/manhattan/types';
import { inflate } from 'pako';

export function parseBedLine(region: string): SummaryStatisticSNP | null {
    try {
        const p = region.split("\t");
        return {
            coordinates: {
                chromosome: p[0],
                start: +p[1],
                end: +p[2]
            },
            rsId: p[3],
            score: +p[4]
        };
    } catch (e) {
        return null;
    }
}

export function parseBedContents(text: string): SummaryStatisticSNP[] {
    return text
        .split('\n')
        .map(parseBedLine)
        .filter(x => x !== null)
        .map(x => x!);
}

export function readBed(file: File, onComplete: (regions: SummaryStatisticSNP[]) => void, onError: (error: any) => void) {
    const textReader = new FileReader();
    const loadBinary = () => {
        const binaryReader = new FileReader();
        binaryReader.onload = (e) => {
            try {
                const results = parseBedContents(new TextDecoder().decode(inflate((e.target?.result || '') as string)));
                if (results.length === 0) throw new Error(`No regions were found in ${file.name}`);
                e.target && onComplete(results);
            } catch (e) {
                onError(e);
            }
        };
        binaryReader.readAsBinaryString(file);
        binaryReader.onerror = onError;
    };
    textReader.onload = (e) => {
        try {
            const newRegions = e.target ? parseBedContents(e.target.result as string) : [];
            if (newRegions.length > 0) onComplete(newRegions);
            else loadBinary();
        } catch (e) {
            loadBinary();
        }
    };
    textReader.onerror = loadBinary;
    textReader.readAsText(file);
}
