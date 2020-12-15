import React from 'react';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import reCard from '../../../images/recard.svg';
import { RECardProps } from './types';

const RECard: React.FC<RECardProps> = props => (
    <Card style={{ width: "100%" }}>
        <Image src={reCard} wrapped ui={false} alt="TFBS" />
        <Card.Content>
            <Card.Description>
                Enhancers and promoters from ENCODE and PsychENCODE.
            </Card.Description>
            <Card.Meta>2M elements • 837 cell types</Card.Meta>
        </Card.Content>
        <Card.Content>
            <Link to={props.link}>Search »</Link>
        </Card.Content>
    </Card>
);
export default RECard;
