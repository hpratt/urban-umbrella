import React, { useCallback, useState } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WrappedBatchRegionSearch } from 'genomic-file-upload';

import { RDHS, RDHSRow } from './types';
import { RDHS_QUERY } from './queries';
import { Navbar } from '../navbar';
import { RDHSDataTable } from './datatable';
import { Banner } from './banner';
import { GenomicRange } from 'genomic-file-upload/dist/utilities/types';
import { tissueZScores } from './utilities/tissue';
import RDHSBrowser from './browser/browser';

const RDHSPage: React.FC = () => {

    const [ rows, setRows ] = useState<RDHSRow[] | null>(null);
    const [ regions, setRegions ] = useState<GenomicRange | null>(null);

    const loadBatch = useCallback( async (coordinates: GenomicRange[]): Promise<RDHSRow[]> => {
        setRegions(coordinates[0]);
        return fetch("https://psychscreen.api.wenglab.org/graphql", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: RDHS_QUERY,
                variables: { coordinates }
            })
        }).then(response => response.json()).then(
            response => {
                return response.data.rDHSQuery.map( (x: RDHS) => ({
                    accession: x.accession,
                    coordinates: x.coordinates,
                    tissueZScores: tissueZScores(x.zScores)
                }));
            }
        );
    }, []);

    return (
        <>
            <Navbar />
            <Banner />
            <Container style={{ marginTop: "3em", width: rows === null ? undefined : "95%" }}>
                { rows === null ? (
                    <WrappedBatchRegionSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region to search for regulatory elements:"
                        onError={error => { setRows([]); console.log(error); }}
                    />
                ) : (
                    <>
                        <Header as="h3">Your search returned {rows.length} regulatory element{rows.length !== 1 ? "s" : ""}:</Header>
                        <RDHSBrowser data={rows} domain={regions!} />
                        <RDHSDataTable
                            data={rows}
                        />
                    </>
                )}
            </Container>
        </>
    );

};
export default RDHSPage;
