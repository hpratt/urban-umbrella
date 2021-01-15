import React, { useCallback, useContext, useState } from 'react';
import { SearchProps } from './types';
import { Header, Button, Grid, Search } from 'semantic-ui-react';
import { SNP_AUTOCOMPLETE_QUERY } from '../../qtl/queries';
import { ClientContext } from '../../../App';
import { SNPWithCoordinates } from '../../qtl/types';
import { matchGenomicRegion, matchIsGenomicCoordinate } from '../../qtl/page';

export const HomepageSearch: React.FC<SearchProps> = props => {
    const [ search, setSearch ] = useState("");
    const [ suggestions, setSuggestions ] = useState<any[] | Record<string, any> | undefined>(undefined);
    const client = useContext(ClientContext);

    const getSuggestions = useCallback(async (_: any, d: any): Promise<any[] | Record<string, any> | undefined> => {
        return fetch(client, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SNP_AUTOCOMPLETE_QUERY,
                variables: { snpid: d.value }
            })
        }).then(response => response.json()).then(
            response => {
                const results: any[] = response.data.snpAutocompleteQuery.map( (x: SNPWithCoordinates) => ({
                    title: x.rsId,
                    description: `${x.coordinates.chromosome}:${x.coordinates.start.toLocaleString()}-${x.coordinates.end.toLocaleString()}`
                })).slice(0, 3);
                if (matchIsGenomicCoordinate(matchGenomicRegion(d.value)))
                    results.push({ title: d.value, description: "genomic coordinates (GRCh38 assembly)" });
                else if (results.length === 0)
                    results.push({ title: d.value, description: "(no suggestions)" });
                return results;
            }
        )
    }, [ client ]);

    return (
        <>
            <Grid.Row />
            <Grid.Row>
                <Grid.Column width={1} />
                <Grid.Column width={14}>
                    <Header as="h2">Enter a SNP to view associated annotations:</Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={1} />
                <Grid.Column width={13}>
                    <Search
                        style={{ width: "100%" }}
                        icon="search"
                        onSearchChange={(e: any, d: any) => { setSearch(d.value); getSuggestions(e, d).then(setSuggestions); }}
                        results={suggestions}
                        input={{ fluid: true }}
                        onKeyUp={(e: any) => e.keyCode === 13 && props.onSearchAccept(search)}
                    /><br />
                    <em>Examples: rs2838663</em>
                </Grid.Column>
                <Grid.Column>
                    <Button onClick={ () => props.onSearchAccept(search) }>Go</Button><br />
                </Grid.Column>
            </Grid.Row>
        </>
    );
}
export default HomepageSearch;
