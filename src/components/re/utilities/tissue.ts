import { groupBy } from 'queryz';

import { ZScore } from "../types";

export const TISSUE_MAP: Map<string, string> = new Map([
    ["ACC", "anterior cingulate cortex"],
    ["DSPFC", "dorsolateral prefrontal cortex"],
    ["INS", "insula"],
    ["ITC", "inferior temporal cortex"],
    ["MDT", "mediodorsal thalamus"],
    ["MOFC", "medial orbitofrontal cortex"],
    ["PMC", "primary motor cortex"],
    ["PTM", "putamen"],
    ["PVC", "primary visual cortex"],
    ["PSTC", "posterior superior temporal cortex"],
    ["VLPFC", "ventrolateral prefrontal cortex"],
    ["BAMG", "basal amygdala"],
    ["HC", "hippocampus"],
    ["NA", "nucleus accumbens"],
    ["FPPFC", "Frontopolar prefrontal cortex"],
    ["NAcc", "nucleus accumbens (NAcc)"],
    ["PFC", "prefrontal cortex (BA9)"],
    ["CAU", "Caudate"],    
    ["PL", "Parietal Lobe"],
    ["SN", "Substantia Nigra"],
    ["STG", "Superior Temporal Gyri"],
    ["MFG", "Middle Frontal Gyrus"],
    ["MTG", "Middle Temporal Gyri"],
    ["SMTG", "Superior and Middle Temporal Gyri"]
]);

export function tissueFromExperimentName(name: string): string {
    return (name.split("_")[1] || "unknown") + " " + name.split("_")[2];
}

export function tissueZScores(scores: ZScore[]): Map<string, number[]> {
    return groupBy(scores, x => tissueFromExperimentName(x.experiment), x => x.score);
}

export function summaryZScores(scores: ZScore[]): Map<string, number[]> {
    return groupBy(scores, x => x.experiment.split("_")[2], x => x.score);
}
