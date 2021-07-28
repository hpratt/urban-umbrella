import { gql } from "@apollo/client";
import { GenomicRange } from "../types";

export const LD_QUERY = gql`
query SNP(
  $snpids: [String]!
) {
  snpQuery(assembly: "hg38", snpids: $snpids) {
    id
    coordinates {
      chromosome
      start
      end
    }
  }
}
`;

export type LDEntry = {
    id: string;
    coordinates: GenomicRange;
    rSquared: number;
};

export type GeneEntry = {
    name: string;
    id: string;
    coordinates: GenomicRange;
};

export type LDQueryResponse = {
    snpQuery: {
        id: string;
        coordinates: GenomicRange;
        [key: string]: LDEntry[] | string | GenomicRange;
    }[];
};
