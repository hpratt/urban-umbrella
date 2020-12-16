import React from 'react';
import { Checkbox, Dropdown, Icon } from "semantic-ui-react";
import { UploadWithRegionOrSNPSearchBoxProps } from 'genomic-file-upload/dist/components/upload/WithSearchBox';

import { ExampleProps } from './types';
import LDDetailsModal from '../tfbs/modal/LDModal/LDDetailsModal';

const POPULATIONS = [
    { text: 'African', value: 'AFR' },
    { text: 'Native American', value: 'AMR' },
    { text: 'Asian', value: 'ASN' },
    { text: 'European', value: 'EUR' },
];

const aStyle = {
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'arial, sans-serif',
    color: '#069',
    cursor: 'pointer',
    outline: 'none',
};

export const Example = (eprops: ExampleProps) => (props: UploadWithRegionOrSNPSearchBoxProps) => (
    <>
        <span>
            {'example: '}
            <span
                style={aStyle}
                onClick={() =>
                    props.onSearchSubmitted({
                        chromosome: 'chr1',
                        start: 100_000_000,
                        end: 100_100_000,
                    })
                }
            >
                chr1:100,000,000-100,100,000
            </span> or&nbsp;
            <span
                style={aStyle}
                onClick={() =>
                    props.onSearchSubmitted("rs2836883")
                }
            >
                rs2836883
            </span>
        </span><br /><br />
        <>
            <Checkbox
                onClick={() => eprops.onLDPreferencesChanged({ ...eprops.ldPreferences, using: !eprops.ldPreferences.using })}
                checked={eprops.ldPreferences.using}
                label="Include SNPs in linkage disequilibrium with the query"
                style={{ marginBottom: '1.1em' }}
            /><br />
            { eprops.ldPreferences.using && (
                <>
                    <strong style={{ fontSize: '1.1em', marginRight: '1.1em' }}>Select a Population:</strong>
                    <Dropdown
                        options={POPULATIONS}
                        value={eprops.ldPreferences.population}
                        onChange={(_, { value }) => eprops.onLDPreferencesChanged({ ...eprops.ldPreferences, population: value as string })}
                        disabled={!eprops.ldPreferences.using}
                    />
                    <br />
                    <strong style={{ fontSize: '1.1em', marginRight: '1.1em' }}>
                        r<sup>2</sup> threshold:
                    </strong>
                    <input
                        onChange={e => eprops.onLDPreferencesChanged({ ...eprops.ldPreferences, rSquared: +e.target.value })}
                        value={eprops.ldPreferences.rSquared}
                        disabled={!eprops.ldPreferences.using}
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
    </>
);
