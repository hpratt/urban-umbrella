import { gql } from "@apollo/client";
import { GenomicRange } from "../types";

export const LD_QUERY = gql`
query SNP(
  $snpids: [String]!
  $rSquaredThreshold: Float!
  $population: Population!
  $subpopulation: SubPopulation
) {
  snpQuery(assembly: "hg38", snpids: $snpids) {
    id
    coordinates {
      chromosome
      start
      end
    }
    linkageDisequilibrium(
      population: $population
      subpopulation: $subpopulation
      rSquaredThreshold: $rSquaredThreshold
    ) {
      id
      coordinates(assembly: "hg38") {
        chromosome
        start
        end
      }
      rSquared
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
        linkageDisequilibrium: LDEntry[];
    }[];
};
