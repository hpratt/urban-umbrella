import React, { useCallback, useState } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WrappedBatchRegionSearch } from 'genomic-file-upload';

import { GenomicRange, TFBS } from './types';
import { TFBS_QUERY } from './queries';
import { Navbar } from '../navbar';
import { TFBSDataTable } from './datatable';
import { Banner } from './banner';

const TFBSPage: React.FC = () => {

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

    return (
        <>
            <Navbar />
            <Banner />
            <Container style={{ marginTop: "3em" }}>
                { rows === null ? (
                    <WrappedBatchRegionSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region to search for transcription factor binding sites:"
                        onError={error => { setRows([]); console.log(error); }}
                        example="example: chr1:1,051,700-1,051,800"
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
