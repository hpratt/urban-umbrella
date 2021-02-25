import React, { useReducer } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';

import { LDDetailsModalProps, LDOptions, LDDetailsModalAction } from './types';

function reducer(state: LDOptions, action: LDDetailsModalAction): LDOptions {
    switch (action.type) {
        case 'SET_POPULATION':
            return {
                ...state,
                population: action.population
            };
        case 'SET_R_SQUARED_THRESDHOLD':
            return {
                ...state,
                rSquaredThreshold: action.rSquaredThreshold
            };
    }
}

const POPULATIONS: { [ key: string ]: string } = {
    AFRICAN: "African",
    AMERICAN: "Native American",
    SOUTH_ASIAN: "South Asian",
    EAST_ASIAN: "East Asian",
    EUROPEAN: "European"
};

export const LDDetailsModal: React.FC<LDDetailsModalProps> = props => {
    const [ state, dispatch ] = useReducer(reducer, { population: "AFRICAN", rSquaredThreshold: 0.7 });
    return (
        <Modal open>
            <Modal.Header>LD Search Options</Modal.Header>
            <Modal.Content>
                Select a population:
                { Object.keys(POPULATIONS).map( abbreviation => (
                    <Button
                        key={abbreviation}
                        icon={abbreviation === state.population ? "check" : undefined}
                        onClick={() => dispatch({ type: 'SET_POPULATION', population: abbreviation })}
                    >
                        {POPULATIONS[abbreviation]}
                    </Button>
                ))}
                Select an r<sup>2</sup> threshold:
                <Slider
                    settings={{ start: 0.7, min: 0, max: 1, onChange: (value: number) => dispatch({ type: 'SET_R_SQUARED_THRESDHOLD', rSquaredThreshold: value }) }}
                    color="#000088"
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => props.onAccept(state)}>Search</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default LDDetailsModal;
