import React from 'react';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import tfbsCard from '../../../images/tfbs.svg';
import { TFBSCardProps } from './types';

const TFBSCard: React.FC<TFBSCardProps> = props => (
    <Card style={{ width: "100%" }}>
        <Image src={tfbsCard} wrapped ui={false} alt="TFBS" />
        <Card.Content>
            <Card.Description>
                Binding sites and motifs for nearly 700 transcription factors.
            </Card.Description>
            <Card.Meta>682 TFs • 142 cell types</Card.Meta>
        </Card.Content>
        <Card.Content>
            <Link to={props.link}>Search »</Link>
        </Card.Content>
    </Card>
);
export default TFBSCard;
