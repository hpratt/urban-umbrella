export const TFBS_QUERY = `
  query TFBS($coordinates: [GenomicRegionInput!]) {
    meme_occurrences(genomic_region: $coordinates) {
      pwm
      genomic_region {
        chromosome
        start
        end
      }
      strand
      q_value
    }
  }
`;
