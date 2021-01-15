import React, { useCallback, useContext, useState } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WrappedBatchRegionOrSNPSearch } from 'genomic-file-upload';

import { GenomicRange, TFBS } from './types';
import { TFBS_QUERY } from './queries';
import { Navbar } from '../navbar';
import { TFBSDataTable } from './datatable';
import { Banner } from './banner';
import { SNP_AUTOCOMPLETE_QUERY } from '../qtl/queries';
import { ClientContext } from '../../App';
import { matchGenomicRegion, matchIsGenomicCoordinate } from '../qtl/page';
import { SNPWithCoordinates } from '../qtl/types';

const TFBSPage: React.FC = () => {

    const client = useContext(ClientContext);
    const [ rows, setRows ] = useState<TFBS[] | null>(null);

    const loadBatch = useCallback( async (coordinates: GenomicRange[]): Promise<TFBS[]> => {
        return fetch("https://ga.staging.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: TFBS_QUERY,
                variables: { coordinates }
            })
        }).then(response => response.json()).then(
            response => response.data.meme_occurrences
        );
    }, []);

    const getSuggestions = useCallback(async (_: any, d: any): Promise<any[] | Record<string, any> | undefined> => {
        return fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_AUTOCOMPLETE_QUERY,
                variables: { snpid: d.value }
            })
        }).then(response => response.json()).then(
            response => {
                const results: any[] = response.data.snpAutocompleteQuery.map( (x: SNPWithCoordinates) => ({
                    title: x.rsId,
                    description: `${x.coordinates.chromosome}:${x.coordinates.start.toLocaleString()}-${x.coordinates.end.toLocaleString()}`
                })).slice(0, 3);                
                if (matchIsGenomicCoordinate(matchGenomicRegion(d.value)))
                    results.push({ title: d.value, description: "genomic coordinates (GRCh38 assembly)" });
                else if (results.length === 0)
                    results.push({ title: d.value, description: "(no suggestions)" });
                return results;
            }
        )
    }, [ client ]);

    return (
        <>
            <Navbar />
            <Banner />
            <Container style={{ marginTop: "3em" }}>
                { rows === null ? (
                    <WrappedBatchRegionOrSNPSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region to search for transcription factor binding sites:"
                        onError={error => { setRows([]); console.log(error); }}
                        example="example: chr1:1,051,700-1,051,800"
                        getSuggestions={getSuggestions}
                    />
                ) : (
                    <>
                        <Header as="h3">Your search returned {rows.length} transcription factor binding site{rows.length !== 1 ? "s" : ""}:</Header>
                        <TFBSDataTable
                            data={rows}
                        />
                    </>
                )}
            </Container>
        </>
    );

};
export default TFBSPage;
