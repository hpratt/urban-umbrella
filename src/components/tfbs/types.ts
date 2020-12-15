export type GenomicRange = {
    chromosome: string;
    start: number;
    end: number;
}

export interface TFBS {
    pwm: number[][];
    strand: string;
    genomic_region: GenomicRange;
    q_value: number;
};

export type SNPQueryResult = {
    TFBS: TFBS[];
};
