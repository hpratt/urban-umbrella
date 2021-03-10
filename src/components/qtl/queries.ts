export const SNP_QUERY = `
  query SNP($coordinates: [GenomicRangeInput], $gene_name_prefix: [String!]) {
    snpQuery(assembly: "hg38", coordinates: $coordinates, common: true) {
      id
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
    gene(name_prefix: $gene_name_prefix, assembly: "grch38") {
      name
      id
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`;

export const SNP_QUERY_BY_ID = `
  query SNP($snpids: [String!], $gene_name_prefix: [String!]) {
    snpQuery(assembly: "hg38", snpids: $snpids) {
      id
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
    gene(name_prefix: $gene_name_prefix, assembly: "grch38") {
      name
      id
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`;

export const SNP_AUTOCOMPLETE_QUERY = `
  query SNP($snpid: String!) {
    snpAutocompleteQuery(assembly: "hg38", snpid: $snpid) {
      id
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`;

export const LD_QUERY = `
  query SNP(
    $snpids: [String]!
    $rSquaredThreshold: Float!
    $population: Population!
    $subpopulation: SubPopulation
  ) {
    snpQuery(assembly: "hg38", snpids: $snpids) {
      id
      linkageDisequilibrium(
        population: $population
        subpopulation: $subpopulation
        rSquaredThreshold: $rSquaredThreshold
      ) {
        id
        rSquaredThreshold
      }
    }
  }
`;
