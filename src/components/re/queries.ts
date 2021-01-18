export const RDHS_QUERY = `
  query RDHS($coordinates: [GenomicRangeInput!]) {
    rDHSQuery(assembly: "grch38", coordinates: $coordinates) {
      accession
      coordinates {
        chromosome
        start
        end
      }
      zScores {
        experiment
        score
      }
    }
  }
`;

export const LD_QUERY_WITH_COORDINATES = `
  query SNP($snpids: [String]!, $rSquaredThreshold: Float!, $population: String!) {
    snpQuery(assembly: "hg38", snpids: $snpids) {
      id
      coordinates {
        chromosome
        start
        end
      }
      linkageDisequilibrium(population: $population, rSquaredThreshold: $rSquaredThreshold) {
        id
        rSquared
        coordinates(assembly: "hg38") {
          chromosome
          start
          end
        }
      }
    }
  }
`;
