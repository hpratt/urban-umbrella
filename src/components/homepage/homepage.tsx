import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Grid, Container, Divider, Header } from 'semantic-ui-react';

import { Routes } from '../../routes';
import { Banner } from './banner';
import { QTLCard, TFBSCard, RECard } from './card';
import { HomepageSearch } from './search';

const Homepage: React.FC = () => {
    const [ search, setSearch ] = useState<string | undefined>(undefined);
    return search ? <Redirect to={`/snp/${search}`} /> : (
        <div style={{ minHeight: "100%" }}>
            <Banner />
            <Container style={{ width: "80%", marginTop: "1em" }}>
                <Grid>
                    <HomepageSearch onSearchAccept={setSearch} />
                    <Grid.Row>
                        <Divider style={{ width: "100%" }} />
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={1} />
                        <Grid.Column width={14}>
                            <Header as="h2">
                                Or, upload BED files or SNP lists to intersect with genomic annotations:
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={1} />
                        <Grid.Column width={3}>
                            <QTLCard link={Routes.qtl()} />
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <TFBSCard link={Routes.tfbs()} />
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <RECard link={Routes.re()} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </div>
    );
};
export default Homepage;
