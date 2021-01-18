import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { SNP_QUERY } from './queries';
import { SNPQueryResponse } from './types';

const client = new ApolloClient<any>({
    uri: 'https://snps.staging.wenglab.org/graphql',
    cache: new InMemoryCache(),
});

export function useSNPData(id: string, assembly: string, population: string) {
    assembly = "hg38";
    return useQuery<SNPQueryResponse>(SNP_QUERY, {
        client,
        variables: {
            snpids: id,
            assembly,
            population,
        },
        errorPolicy: 'ignore',
    });
}
