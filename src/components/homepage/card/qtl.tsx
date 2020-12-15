import React from 'react';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import qtlCard from '../../../images/qtlcard.svg';
import { QTLCardProps } from './types';

const QTLCard: React.FC<QTLCardProps> = props => (
    <Card style={{ width: "100%" }}>
        <Image src={qtlCard} wrapped ui={false} alt="open chromatin map" />
        <Card.Content>
            <Card.Description>
                eQTLs from GTEx, PsychENCODE, and other sources.
            </Card.Description>
            <Card.Meta>100k eQTLs • 10 tissues</Card.Meta>
        </Card.Content>
        <Card.Content>
            <Link to={props.link}>Search »</Link>
        </Card.Content>
    </Card>
);
export default QTLCard;
