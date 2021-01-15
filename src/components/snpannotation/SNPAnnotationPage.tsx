import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Checkbox, Container, Divider, Dropdown, Icon, Loader, Menu, Message } from 'semantic-ui-react';
import { Banner } from '../homepage/banner';
import { Navbar } from '../navbar';
import { useSNPData } from './hooks';
import MotifIntersectionView from './MotifIntersectionView';
import PeakIntersectionView from './PeakIntersectionView';
import SNPSearchBox from './SNPSearchBox';

const POPULATIONS = [
    { text: 'African', value: 'AFR' },
    { text: 'Native American', value: 'AMR' },
    { text: 'Asian', value: 'ASN' },
    { text: 'European', value: 'EUR' },
];

const POPULATION_MAP = new Map(POPULATIONS.map(x => [x.value, x.text]));

const SNPAnnotationPage: React.FC = () => {
    const { assembly } = useParams<{ assembly: string }>();
    const [rsId, setrsId] = useState('');
    const [ld, setLD] = useState(false);
    const [population, setPopulation] = useState(POPULATIONS[0].value);
    const [rSquaredThreshold, setRSquaredThreshold] = useState(0.7);
    const [page, setPage] = useState(-1);
    const { data, loading } = useSNPData(rsId, assembly, population);
    const snps = useMemo(
        () =>
            data === undefined || data.snpQuery[0] === undefined
                ? []
                : ld
                ? [
                      { ...data.snpQuery[0], rSquared: 1.0 },
                      ...data.snpQuery[0].linkageDisequilibrium
                          .filter(x => x.rSquared > rSquaredThreshold)
                          .map(x => ({ ...x.snp, rSquared: x.rSquared })),
                  ]
                : [{ ...data.snpQuery[0], rSquared: 1.0 }],
        [data, rSquaredThreshold, ld]
    );

    return (
        <>
            <Navbar />
            <Banner />
            <Container style={{ marginTop: '3em' }}>
                {rsId === '' ? (
                    <>
                        <h2>Enter a SNP to search for intersecting transcription factor binding sites and motifs:</h2>
                        <SNPSearchBox assembly={assembly} onSearchEnter={setrsId} />
                        <Divider style={{ marginTop: '5em', marginBottom: '3em' }} />
                        <h3>
                            <Icon name="settings" /> Linkage Disequilibrium settings
                        </h3>
                        <Checkbox
                            onClick={() => setLD(!ld)}
                            checked={ld}
                            label="Include SNPs in linkage disequilibrium with the query"
                            style={{ marginBottom: '1.1em' }}
                        />
                        <br />
                        {ld && (
                            <>
                                <strong style={{ fontSize: '1.1em', marginRight: '1.1em' }}>Select a Population:</strong>
                                <Dropdown
                                    options={POPULATIONS}
                                    defaultValue={population}
                                    onChange={(_, { value }) => setPopulation(value as string)}
                                />
                                <br />
                                <strong style={{ fontSize: '1.1em', marginRight: '1.1em' }}>
                                    r<sup>2</sup> threshold:
                                </strong>
                                <input
                                    onChange={e => setRSquaredThreshold(+e.target.value)}
                                    defaultValue={rSquaredThreshold}
                                />
                                <br />
                                <br />
                                <em>
                                    LD data is derived from the{' '}
                                    <a href="https://www.internationalgenome.org/">1,000 Genomes Project</a>.
                                </em>
                            </>
                        )}
                    </>
                ) : loading ? (
                    <Loader active>Loading...</Loader>
                ) : (
                    <>
                        <h2>ENCODE TF annotations for {rsId}</h2>
                        {ld && (
                            <em>
                                Including SNPs in LD in the {POPULATION_MAP.get(population)} population, r<sup>2</sup> &gt;
                                {rSquaredThreshold}
                            </em>
                        )}
                        <br />
                        <Button
                            onClick={() => {
                                setrsId('');
                                setPage(-1);
                            }}
                            icon="left arrow"
                            labelPosition="left"
                            size="small"
                            content="Perform a New Search"
                        />
                        <Divider style={{ marginBottom: '2em' }} />
                        {page === -1 ? <Message info>{snps.length} SNPs matched your query.</Message> : ''}
                        <Menu secondary>
                            <Menu.Item>
                                <strong>Select an annotation:</strong>
                            </Menu.Item>
                            <Menu.Item onClick={() => setPage(0)} active={page === 0}>
                                Peak Intersection
                            </Menu.Item>
                            <Menu.Item onClick={() => setPage(1)} active={page === 1}>
                                Motif Intersection
                            </Menu.Item>
                        </Menu>
                        {page === 0 ? (
                            <PeakIntersectionView snps={snps} assembly={assembly === 'hg38' ? 'GRCh38' : assembly} />
                        ) : page === 1 ? (
                            <MotifIntersectionView snps={snps} assembly={assembly} />
                        ) : null}
                    </>
                )}
            </Container>
        </>
    );
};
export default SNPAnnotationPage;
