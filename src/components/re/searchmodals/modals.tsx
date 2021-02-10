import React, { useState } from 'react';
import ConfirmTissueFilterModal from './confirmtissues';
import TissueFilterModal from './tissuefiltermodal';

export type ModalProps = {
    onAccept: (tissues: Set<string>) => void;
    onCancel: () => void;
};

const SearchModal: React.FC<ModalProps> = props => {
    const [ phase, setPhase ] = useState(0);
    return phase === 0 ? (
        <ConfirmTissueFilterModal
            onAccept={() => setPhase(1)}
            onCancel={props.onCancel}
        />
    ) : (
        <TissueFilterModal
            onAccept={tissues => tissues.size > 0 ? props.onAccept(tissues) : props.onCancel()}
        />
    );
};
export default SearchModal;
