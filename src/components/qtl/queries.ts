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
