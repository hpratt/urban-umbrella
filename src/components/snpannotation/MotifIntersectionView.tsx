import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    IntersectionViewProps,
    MotifOccurrenceMatchWithSNP,
    MotifIntersectionMergerProps,
} from './types';
import { Menu, Message, Modal, Progress } from 'semantic-ui-react';
import { groupBy } from 'queryz';
import { DataTable } from 'ts-ztable';
import { COMPLETE_MOTIF_TABLE_COLUMNS, MOTIF_TABLE_COLUMNS } from './tables';
import { MOTIF_QUERY } from './queries';
import { GenomicRange } from '../qtl/types';

function f(coordinates: GenomicRange): { chromosome: string; start: number; end: number } {
    return {
        chromosome: coordinates.chromosome!,
        start: coordinates.start!,
        end: coordinates.end!,
    };
}

const MotifIntersectionMerger: React.FC<MotifIntersectionMergerProps> = props => {
    const [progress, setProgress] = useState(0);

    const next = useCallback(
        (i: number, results: MotifOccurrenceMatchWithSNP[]) => {
            if (i === props.snps.length) props.onResultsReceived(results);
            else if (!props.snps[i]?.coordinates?.chromosome) next(i + 1, results);
            else
                fetch("https://ga.staging.wenglab.org/graphql", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: MOTIF_QUERY,
                        variables: { range: f(props.snps[i].coordinates) }
                    })
                }).then(x => x.json()).then(x => {
                    setProgress(i + 1);
                    next(i + 1, [
                        ...results,
                        ...x.data.meme_occurrences
                            .filter((x: any) => x && x.motif !== null)
                            .map((x: any) => ({ ...x, snp: props.snps[i] })),
                    ]);
                });
        },
        [props]
    );

    useEffect(() => {
        setProgress(0);
        next(0, []);
    }, [props.snps, next]);

    return (
        <Modal open>
            <Modal.Header>Searching for intersecting TF motifs...</Modal.Header>
            <Modal.Content>
                <Progress
                    percent={((progress * 100.0) / props.snps.length).toFixed(2)}
                    progress
                    size="medium"
                    indicating
                />
            </Modal.Content>
        </Modal>
    );
};

const MotifIntersectionView: React.FC<IntersectionViewProps> = props => {
    const [results, setResults] = useState<MotifOccurrenceMatchWithSNP[] | null>(null);
    const [page, setPage] = useState(0);
    const groupedSNPs = useMemo(() => {
        const grouped = groupBy(
            results || [],
            x => x.snp.rsId,
            x => x
        );
        return props.snps.map(snp => ({
            ...snp,
            motifCount:
                grouped.get(snp.rsId)?.filter(x => x.motif.flank_p_value < 0.05 && x.motif.shuffled_p_value < 0.05)
                    .length || 0,
        }));
    }, [results, props.snps]);
    const filteredResults = useMemo(
        () => (results || []).filter(x => x.motif.flank_p_value < 0.05 && x.motif.shuffled_p_value < 0.05),
        [results]
    );

    return results === null ? (
        <MotifIntersectionMerger snps={props.snps} onResultsReceived={setResults} assembly={props.assembly} />
    ) : (
        <>
            <Message info>
                Searched {props.snps.length} SNPs, of which {groupedSNPs.filter(x => x.motifCount > 0).length} intersect
                at least one TF motif.
            </Message>
            <Menu secondary pointing>
                <Menu.Item active={page === 0} onClick={() => setPage(0)}>
                    Summary View
                </Menu.Item>
                <Menu.Item active={page === 1} onClick={() => setPage(1)}>
                    Complete List
                </Menu.Item>
            </Menu>
            {page === 0 ? (
                <DataTable
                    key="summary"
                    columns={MOTIF_TABLE_COLUMNS}
                    rows={groupedSNPs}
                    sortColumn={2}
                    searchable
                    itemsPerPage={7}
                />
            ) : (
                <DataTable
                    key="complete"
                    columns={COMPLETE_MOTIF_TABLE_COLUMNS}
                    rows={filteredResults}
                    sortColumn={3}
                    searchable
                    itemsPerPage={3}
                />
            )}
        </>
    );
};
export default MotifIntersectionView;
