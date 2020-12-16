import { GenomicRange } from "genomic-file-upload/dist/utilities/types";
import { GraphQLLDTrackProps } from "umms-gb";
import { LDPreferences } from "../../ld/types";
import { NamedRegion, RDHSRow } from "../types";

export type RDHSBrowserProps = {
    data: RDHSRow[];
    domain: GenomicRange;
    ldPreferences: LDPreferences;
    anchor?: string;
    onDomainChanged?: (domain: GenomicRange) => void;
};

export type RDHSBrowserPageProps = {
    data: RDHSRow[];
    ranges: NamedRegion[];
    ldPreferences: LDPreferences;
};
