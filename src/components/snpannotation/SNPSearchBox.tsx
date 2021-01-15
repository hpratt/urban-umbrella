import { ApolloClient, InMemoryCache } from '@apollo/client';
import React, { useCallback, useState } from 'react';
import { Form, Search, Button, SearchProps } from 'semantic-ui-react';
import { SNP_AUTOCOMPLETE_QUERY } from './queries';
import { AutocompleteSNPQueryResponse, SNPAutocompleteSearchBoxProps } from './types';

const client = new ApolloClient<any>({
    uri: 'https://snps.staging.wenglab.org/graphql',
    cache: new InMemoryCache(),
});

const SNPSearchBox: React.FC<SNPAutocompleteSearchBoxProps> = props => {
    const [suggestions, setSuggestions] = useState<{ title: string; description: string }[]>([]);
    const getSuggestions = useCallback(
        (_: React.MouseEvent<HTMLElement, MouseEvent>, data: SearchProps) => {
            client
                .query<AutocompleteSNPQueryResponse>({
                    query: SNP_AUTOCOMPLETE_QUERY,
                    variables: {
                        snpid: data.value,
                        assembly: "hg38",
                    },
                })
                .then(results =>
                    setSuggestions(
                        results && results.data ? results.data.snpAutocompleteQuery.slice(0, 5).map(x => ({
                            title: x.rsId,
                            description: `${x.coordinates.chromosome}:${x.coordinates.start}-${x.coordinates.end}`,
                        })) : []
                    )
                )
                .catch(() => setSuggestions([]));
            setValue(data.value || '');
        },
        []
    );
    const [value, setValue] = useState('');

    return (
        <Form onSubmit={() => props.onSearchEnter && props.onSearchEnter(value)}>
            <Search
                input={{ fluid: true }}
                placeholder="enter rsID or locus"
                onSearchChange={getSuggestions}
                onResultSelect={(_, d) => setValue(d.result.title)}
                results={suggestions}
                style={{ width: '70%', display: 'inline-block', marginRight: '3px' }}
            />
            <Button onClick={() => props.onSearchEnter && props.onSearchEnter(value)}>Search</Button>
            <br />
            <em>Example: rs3794102</em>
        </Form>
    );
};
export default SNPSearchBox;
