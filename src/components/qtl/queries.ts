export const SNP_QUERY = `
  query SNP($coordinates: [GenomicRangeInput]) {
    snpQuery(assembly: "hg38", coordinates: $coordinates) {
      rsId
      coordinates {
        chromosome
        start
        end
      }
      gtex_eQTLs {
        gene_id
        tissue
        pval_nominal
        slope
        pval_beta
      }
    }
  }
`;

export const LD_QUERY = `
  query SNP($snpids: [String]!, $rSquaredThreshold: Float!, $population: String!) {
    snpQuery(assembly: "hg38", snpids: $snpids) {
      rsId
      linkageDisequilibrium(population: $population, rSquaredThreshold: $rSquaredThreshold) {
        rsId
      }
    }
  }
`;
