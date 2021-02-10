import { compareFnProps } from 'jubilant-carnival/dist/utilities';
import React from 'react';
import { Button, Header, Modal } from 'semantic-ui-react';

export type ConfirmTissueFilterModalProps = {
    onAccept: () => void;
    onCancel: () => void;
}

export const ConfirmTissueFilterModal: React.FC<ConfirmTissueFilterModalProps> = props => (
    <Modal open>
        <Modal.Header>Filter by Brain Region?</Modal.Header>
        <Modal.Content>
            <Header as="h3">
                Would you like to filter search results to show regulatory elements active in particular brain regions?
            </Header>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={props.onAccept}>Yes, select brain regions</Button>
            <Button onClick={props.onCancel}>No, show all elements</Button>
        </Modal.Actions>
    </Modal>
);
export default ConfirmTissueFilterModal;
