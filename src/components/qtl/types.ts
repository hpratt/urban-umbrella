export type GenomicRange = {
    chromosome: string;
    start: number;
    end: number;
}

export interface QTL {
    gene_id: string;
    tissue: string;
    pval_nominal: number;
    slope: number;
    pval_beta: number;
};

export type SNPWithCoordinates = {
    rsId: string;
    coordinates: GenomicRange;
    gtex_eQTLs: QTL[];
};

export type SNPWithQTL = {
    rsId: string;
    coordinates: GenomicRange;
    gtex_eQTLs: QTL[];
};

export type SNPQueryResult = {
    snpQuery: SNPWithQTL[];
};

export interface QTLDataTableRow extends QTL {
    snp: string;
};
