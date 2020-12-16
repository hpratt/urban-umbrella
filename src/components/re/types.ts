import { WrappedBatchedRegionOrSNPSearchProps } from "genomic-file-upload";
import { UploadWithRegionOrSNPSearchBoxProps } from "genomic-file-upload/dist/components/upload/WithSearchBox";
import { GenomicRange } from "genomic-file-upload/dist/utilities/types";

export type ZScore = {
    experiment: string;
    score: number;
};

export type RDHS = {
    accession: string;
    coordinates: GenomicRange;
    zScores: ZScore[];
};

export type RDHSRow = {
    accession: string;
    coordinates: GenomicRange;
    tissueZScores: Map<string, number[]>;
    summaryZScores: Map<string, number[]>;
};

export type NamedRegion = {
    region: GenomicRange;
    name: string;
};
