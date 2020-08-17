import React from 'react';
import { Grid, Container } from 'semantic-ui-react';

import { Routes } from '../../routes';
import { Banner } from './banner';
import { QTLCard } from './card';

const Homepage: React.FC = () => (
    <>
        <Banner />
        <Container style={{ width: "80%", marginTop: "1em" }}>
            <Grid>
                <Grid.Column width={4}>
                    <QTLCard link={Routes.qtl()} />
                </Grid.Column>
            </Grid>
        </Container>
    </>
);
export default Homepage;
