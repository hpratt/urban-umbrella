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

export const RDHS_BIOSAMPLE_QUERY = `
query q {
  dnaseBiosamples: ccREBiosampleQuery(assay: "DNase", assembly: "grch38") {
    biosamples {
      name
      experimentAccession(assay: "DNase")
    }
  }
  h3k27acBiosamples: ccREBiosampleQuery(assay: "H3K27ac", assembly: "grch38") {
    biosamples {
      name
      experimentAccession(assay: "H3K27ac")
    }
  }
}
`;

export const EMBRYONIC_RDHS_QUERY = `
query r($coordinates: [GenomicRangeInput!]) {
  rDHSQuery(coordinates: $coordinates, assembly: "GRCh38") {
    dnase: zScores(experiments: [ "ENCSR148MFM", "ENCSR910OQF", "ENCSR973MKT", "ENCSR788SOI", "ENCSR615WIN", "ENCSR678PDD", "ENCSR475VQD", "ENCSR507GFJ", "ENCSR572LDG", "ENCSR118WIQ", "ENCSR820XRX", "ENCSR026EOM", "ENCSR187PYY", "ENCSR595CSH", "ENCSR309FOO", "ENCSR420RWU", "ENCSR156CLC", "ENCSR947POC", "ENCSR344FLH", "ENCSR649KBB" ]) {
      experiment
      score
    }
    h3k27ac: zScores(experiments: [ "ENCSR209QGZ", "ENCSR217AJC" ]) {
      experiment
      score
    }
    accession
    coordinates {
      chromosome
      start
      end
    }
  }
}
`;

export const LD_QUERY_WITH_COORDINATES = `
  query SNP($snpids: [String]!, $rSquaredThreshold: Float!, $population: Population!) {
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
