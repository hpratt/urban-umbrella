import { GenomicRange } from "genomic-file-upload/dist/utilities/types";
import { RDHSRow } from "../types";

export type RDHSBrowserProps = {
    data: RDHSRow[];
    domain: GenomicRange;
};
