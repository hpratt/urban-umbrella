import React, { useCallback, useMemo, useState } from 'react';
import { Button, Checkbox, Modal } from 'semantic-ui-react';
import { TISSUE_MAP } from '../utilities';

export type TissueFilterModalProps = {
    onAccept: (tissues: Set<string>) => void;
};

const TissueFilterModal: React.FC<TissueFilterModalProps> = props => {
    const sortedTissues = useMemo( () => [ ...TISSUE_MAP.keys() ].sort(), []);
    const [ shown, setShown ] = useState<Set<string>>(new Set());
    const toggleItem = useCallback( (item: string) => {
        setShown( shown.has(item) ? new Set([ ...shown ].filter(x => x !== item)) : new Set([ ...shown, item ]) );
    }, [ shown, setShown ]);

    return (
        <Modal open>
            <Modal.Header>Select Brain Regions</Modal.Header>
            <Modal.Content>
                { sortedTissues.map( (x, i) => (
                    <React.Fragment key={x}>
                        <Checkbox
                            onChange={() => toggleItem(x)}
                            label={TISSUE_MAP.get(x) || x}
                            checked={shown.has(x)}
                        /><br />
                    </React.Fragment>
                ))}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => props.onAccept(shown)}>OK</Button>
                <Button onClick={() => props.onAccept(new Set([]))}>Cancel (search all tissues)</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default TissueFilterModal;
