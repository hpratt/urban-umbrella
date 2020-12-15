import React, { useState } from 'react';
import { SearchProps } from './types';
import { Header, Input, Button, Grid } from 'semantic-ui-react';

export const HomepageSearch: React.FC<SearchProps> = props => {
    const [ search, setSearch ] = useState("");
    return (
        <>
            <Grid.Row />
            <Grid.Row>
                <Grid.Column width={1} />
                <Grid.Column width={14}>
                    <Header as="h2">Enter a SNP or genomic region to explore and visualize associated annotations:</Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={1} />
                <Grid.Column width={14}>
                    <Input style={{ width: "90%" }} icon="search" onChange={e => setSearch(e.target.value)} />&nbsp;
                    <Button onClick={ () => props.onSearchAccept(search) }>Go</Button><br />
                    <em>Examples: rs2838663, chr1:110,000,000-110,100,000</em>
                </Grid.Column>
            </Grid.Row>
        </>
    );
}
export default HomepageSearch;
