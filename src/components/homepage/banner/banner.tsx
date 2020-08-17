import React from 'react';
import { Container, Grid, Header } from 'semantic-ui-react';

import { BannerProps } from './types';

const Banner: React.FC<BannerProps> = () => (
    <div style={{ paddingTop: '6em', paddingBottom: '2em', backgroundColor: '#eeeeee' }}>
        <Container>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={3} align="center">
                        [LOGO]
                    </Grid.Column>
                    <Grid.Column width={13} verticalAlign="middle">
                        <span style={{ fontSize: '22pt', fontFamily: 'arial' }}>[Name TBA]</span>
                        <Header as="h4" style={{ marginTop: '0.5em' }}>
                            Explore annotated SNPs and regulatory elements.
                        </Header>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    </div>
);
export default Banner;
