import React from 'react';
import { Container, Grid, Header } from 'semantic-ui-react';

import logo from '../../../images/logo.png';
import { TISSUE_MAP } from '../utilities';
import { BannerProps } from './types';

const Banner: React.FC<BannerProps> = () => (
    <div style={{ paddingTop: '6em', paddingBottom: '2em', backgroundColor: '#eeeeee' }}>
        <Container>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={1} align="center">
                        <img src={logo} alt="logo" />
                    </Grid.Column>
                    <Grid.Column width={13} verticalAlign="middle">
                        <span style={{ fontSize: '22pt', fontFamily: 'arial' }}>
                            Variant Prioritization App: regulatory element search
                        </span>
                        <Header as="h4" style={{ marginTop: '0.5em' }}>
                            Searching OCRs from PsychENCODE (116 ATAC-seq experiments in {[ ...TISSUE_MAP.keys() ].length} brain regions)
                        </Header>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    </div>
);
export default Banner;
