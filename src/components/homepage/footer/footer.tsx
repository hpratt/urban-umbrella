import React from 'react';
import { Container, Grid, Header, Sticky, List } from 'semantic-ui-react';

import { FooterProps } from './types';

const Footer: React.FC<FooterProps> = () => (
    <div style={{ position: "relative", marginTop: "3em", bottom: "0px", backgroundColor: '#eeeeee' }}>
        <Container>
            <Grid divided="vertically">
                <Grid.Row>
                    <Grid.Column width={4}>
                        <Header>Help</Header>
                        <List link>
                            <List.Item as='a'>About</List.Item>
                            <List.Item as='a'>Contact us</List.Item>
                        </List>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Header>API</Header>
                        <List link>
                            <List.Item as='a'>Interactive queries</List.Item>
                            <List.Item as='a'>Documentation</List.Item>
                        </List>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    </div>
);
export default Footer;
