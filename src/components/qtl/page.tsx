import React, { useContext, useCallback, useState } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WrappedBatchRegionSearch } from 'genomic-file-upload';

import { ClientContext } from '../../App';
import { GenomicRange, QTLDataTableRow, SNPWithQTL } from './types';
import { SNP_QUERY } from './queries';
import { Navbar } from '../navbar';
import { QTLDataTable } from './datatable';
import { Banner } from './banner';

const QTLPage: React.FC = () => {

    const client = useContext(ClientContext);
    const [ rows, setRows ] = useState<QTLDataTableRow[] | null>(null);

    const loadBatch = useCallback( async (coordinates: GenomicRange[]): Promise<QTLDataTableRow[]> => {
        return fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_QUERY,
                variables: { coordinates }
            })
        }).then(response => response.json()).then(
            response => {
                const results: QTLDataTableRow[] = [];
                response.data.snpQuery.forEach( (x: SNPWithQTL) => {
                    x.gtex_eQTLs.forEach( q => results.push({
                        ...q,
                        snp: x.rsId
                    }));
                });
                return results;
            }
        );
    }, [ client ]);

    return (
        <>
            <Navbar />
            <Banner />
            <Container style={{ marginTop: "3em" }}>
                { rows === null ? (
                    <WrappedBatchRegionSearch
                        getResults={loadBatch}
                        onComplete={setRows}
                        title="Enter a genomic region to search for eQTLs:"
                        onError={error => { setRows([]); console.log(error); }}
                    />
                ) : (
                    <>
                        <Header as="h3">Your search returned {rows.length} eQTL{rows.length !== 1 ? "s" : ""}:</Header>
                        <QTLDataTable
                            data={rows}
                        />
                    </>
                )}
            </Container>
        </>
    );

};
export default QTLPage;
