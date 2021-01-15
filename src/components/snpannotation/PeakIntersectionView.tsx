import { PEAK_QUERY } from './queries';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IntersectionViewProps, PeakIntersectionMergerProps, PeakWithSNP } from './types';
import { Menu, Message, Modal, Progress } from 'semantic-ui-react';
import { groupBy } from 'queryz';
import { DataTable } from 'ts-ztable';
import { COMPLETE_PEAK_TABLE_COLUMNS, PEAK_TABLE_COLUMNS } from './tables';
import { GenomicRange } from '../qtl/types';

function f(coordinates: GenomicRange): { chrom: string; chrom_start: number; chrom_end: number } {
    return {
        chrom: coordinates.chromosome!,
        chrom_start: coordinates.start!,
        chrom_end: coordinates.end!,
    };
}

const PeakIntersectionMerger: React.FC<PeakIntersectionMergerProps> = props => {
    const [progress, setProgress] = useState(0);

    const next = useCallback(
        (i: number, results: PeakWithSNP[]) => {
            if (i === props.snps.length) props.onResultsReceived(results);
            else if (!props.snps[i]?.coordinates?.chromosome) next(i + 1, results);
            else
                fetch("https://ga.staging.wenglab.org/graphql", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: PEAK_QUERY,
                        variables: { assembly: "grch38", range: f(props.snps[i].coordinates) }
                    })
                }).then(x => x.json()).then(x => {
                    setProgress(i + 1);
                    next(i + 1, [...results, ...x.data.peaks.peaks.map((x: any) => ({ ...x, snp: props.snps[i] }))]);
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
            <Modal.Header>Searching for intersecting ChIP-seq peaks...</Modal.Header>
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

const PeakIntersectionView: React.FC<IntersectionViewProps> = props => {
    const [results, setResults] = useState<PeakWithSNP[] | null>(null);
    const [page, setPage] = useState(0);
    const groupedSNPs = useMemo(() => {
        const grouped = groupBy(
            results || [],
            x => x.snp.rsId,
            x => x
        );
        return props.snps.map(snp => ({
            ...snp,
            peakCount: grouped.get(snp.rsId)?.length || 0,
            factorCount: new Set(grouped.get(snp.rsId)?.map(x => x.dataset.target)).size || 0,
        }));
    }, [results, props.snps]);

    return results === null ? (
        <PeakIntersectionMerger snps={props.snps} onResultsReceived={setResults} assembly={props.assembly} />
    ) : (
        <>
            <Message info>
                Searched {props.snps.length} SNPs, of which {groupedSNPs.filter(x => x.peakCount > 0).length} intersect
                at least one ENCODE TF ChIP-seq peak.
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
                    columns={PEAK_TABLE_COLUMNS}
                    rows={groupedSNPs}
                    sortColumn={2}
                    searchable
                    itemsPerPage={8}
                />
            ) : (
                <DataTable
                    key="complete"
                    columns={COMPLETE_PEAK_TABLE_COLUMNS}
                    rows={results}
                    sortColumn={0}
                    searchable
                />
            )}
        </>
    );
};
export default PeakIntersectionView;
