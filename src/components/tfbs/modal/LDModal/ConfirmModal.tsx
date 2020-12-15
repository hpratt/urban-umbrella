import React from 'react';
import { Modal, Button } from 'semantic-ui-react';

import { ConfirmModalProps } from './types';

export const ConfirmLDModal: React.FC<ConfirmModalProps> = props => (
    <Modal open>
        <Modal.Header>Search for LD SNPs?</Modal.Header>
        <Modal.Content>
            Would you like to search for SNPs in linkage disequilibrium with the
            queried SNPs?
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={props.onAccept}>Yes</Button>
            <Button onClick={props.onCancel}>No</Button>
        </Modal.Actions>
    </Modal>
);
export default ConfirmLDModal;
