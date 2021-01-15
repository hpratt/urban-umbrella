import React from 'react';

import { DataTableColumn } from 'ts-ztable';
import AnnotatedLogo from './AnnotatedLogo';
import {
    MinorAlleleFrequency,
    MotifOccurrenceMatchWithSNP,
    PeakWithSNP,
    SNPWithMotifCount,
    SNPWithPeakCount,
} from './types';

function fq(x: MinorAlleleFrequency): number {
    return (x.afr_af + x.amr_af + x.eas_af + x.eur_af + x.sas_af) / 5;
}

function alteredValue(pwm: number[][], snp: number, ref: string, alt: string, strand: string): number {
    const index = strand === '+' ? snp : pwm.length - snp - 1;
    const refIndex = strand === '+' ? INDEX_MAP.get(ref)! : 3 - INDEX_MAP.get(ref)!;
    const altIndex = strand === '+' ? INDEX_MAP.get(alt)! : 3 - INDEX_MAP.get(alt)!;
    return Math.abs(pwm[index][altIndex] - pwm[index][refIndex]);
}

const INDEX_MAP = new Map([
    ['A', 0],
    ['C', 1],
    ['G', 2],
    ['T', 3],
]);

export const PEAK_TABLE_COLUMNS: DataTableColumn<SNPWithPeakCount>[] = [
    {
        header: 'SNP',
        value: x => x.rsId,
    },
    {
        header: (
            <span>
                r<sup>2</sup> with lead SNP
            </span>
        ),
        value: x => x.rSquared || 0,
    },
    {
        header: 'total intersecting peaks',
        value: x => x.peakCount,
    },
    {
        header: 'unique factors with intersecting peaks',
        value: x => x.factorCount,
    },
];

export const MOTIF_TABLE_COLUMNS: DataTableColumn<SNPWithMotifCount>[] = [
    {
        header: 'SNP',
        value: x => x.rsId,
    },
    {
        header: (
            <span>
                r<sup>2</sup> with lead SNP
            </span>
        ),
        value: x => x.rSquared || 0,
    },
    {
        header: 'total intersecting motifs',
        value: x => x.motifCount,
    },
];

export const COMPLETE_PEAK_TABLE_COLUMNS: DataTableColumn<PeakWithSNP>[] = [
    {
        header: 'SNP',
        value: x => x.snp.rsId || '',
    },
    {
        header: 'SNP coordinates',
        value: x => `${x.snp.coordinates.chromosome}:${x.snp.coordinates.start}`,
    },
    {
        header: (
            <span>
                r<sup>2</sup> with lead SNP
            </span>
        ),
        value: x => x.snp.rSquared || 0,
    },
    {
        header: 'peak coordinates',
        value: x => `${x.chrom}:${x.chrom_start}-${x.chrom_end}`,
    },
    {
        header: 'peak biosample',
        value: x => x.dataset.biosample,
        render: x => x.dataset.biosample,
    },
    {
        header: 'peak factor',
        value: x => x.dataset.target,
        render: x => x.dataset.target,
    },
    {
        header: 'ChIP-seq experiment accession',
        value: x => x.experiment_accession,
        render: x => (
            <a href={`https://www.encodeproject.org/experiments/${x.experiment_accession}`}>{x.experiment_accession}</a>
        ),
    },
    {
        header: 'peak q-value',
        value: x => x.q_value,
    },
];

export const COMPLETE_MOTIF_TABLE_COLUMNS: DataTableColumn<MotifOccurrenceMatchWithSNP>[] = [
    {
        header: 'SNP',
        value: x => x.snp.rsId || '',
    },
    {
        header: 'SNP coordinates',
        value: x => `${x.snp.coordinates.chromosome}:${x.snp.coordinates.start}-${x.snp.coordinates.end}`,
    },
    {
        header: (
            <span>
                r<sup>2</sup> with lead SNP
            </span>
        ),
        value: x => x.snp.rSquared || 0,
    },
    {
        header: 'annotated logo',
        value: x =>
            x.snp.coordinates.start &&
            x.genomic_region.start &&
            x.snp.refAllele &&
            x.snp.minorAlleleFrequency[0] &&
            x.snp.minorAlleleFrequency[0].sequence
                ? alteredValue(
                      x.motif.pwm,
                      x.snp.coordinates.start! - x.genomic_region.start!,
                      x.snp.refAllele,
                      x.snp.minorAlleleFrequency[0].sequence,
                      x.strand
                  )
                : 0,
        render: x => (
            <AnnotatedLogo
                pwm={x.motif.pwm}
                minorAlleles={x.snp.minorAlleleFrequency.map(x => ({ sequence: x.sequence, frequency: fq(x) }))}
                refAllele={x.snp.refAllele}
                refFrequency={x.snp.refFrequency}
                motifCoordinates={x.genomic_region}
                snpCoordinates={x.snp.coordinates}
                strand={x.strand}
            />
        ),
    },
    {
        header: 'best database match',
        value: x => {
            const bestMatch = x.motif.tomtom_matches?.slice().sort((a, b) => a.e_value - b.e_value)[0];
            return bestMatch
                ? `${bestMatch.target_id}${bestMatch.jaspar_name ? `/${bestMatch.jaspar_name}` : ''} (${
                      bestMatch.target_id.startsWith('MA') ? 'JASPAR' : 'HOCOMOCO'
                  })`
                : '--';
        },
    },
    {
        header: 'occurrence q-value',
        value: x => x.q_value,
    },
];
