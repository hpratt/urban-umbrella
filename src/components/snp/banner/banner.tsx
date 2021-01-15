import React from 'react';
import { Container, Grid } from 'semantic-ui-react';

import logo from '../../../images/logo.png';

const Banner: React.FC<{ snp: string }> = props => (
    <div style={{ paddingTop: '6em', paddingBottom: '2em', backgroundColor: '#eeeeee' }}>
        <Container>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={1} align="center">
                        <img src={logo} alt="logo" />
                    </Grid.Column>
                    <Grid.Column width={13} verticalAlign="middle">
                        <span style={{ fontSize: '22pt', fontFamily: 'arial' }}>
                            Variant Prioritization App: annotations for {props.snp}
                        </span>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    </div>
);
export default Banner;
