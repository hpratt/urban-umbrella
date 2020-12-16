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
