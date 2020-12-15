import React, { useState } from 'react';

import { LDModalProps } from './types';
import ConfirmLDModal from './ConfirmModal';
import LDDetailsModal from './LDDetailsModal';

export const LDModal: React.FC<LDModalProps> = props => {
    const [ page, setPage ] = useState(0);
    return (
        page === 0 ? (
            <ConfirmLDModal onAccept={() => setPage(1)} onCancel={props.onCancel} />
        ) : (
            <LDDetailsModal onAccept={props.onAccept} />
        )
    );
};
export default LDModal;
