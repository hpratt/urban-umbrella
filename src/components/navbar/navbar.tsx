import React from 'react';
import { Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { Routes } from '../../routes';
import { NavbarProps } from './types';

const Navbar: React.FC<NavbarProps> = props => (
    <Menu className="top fixed transparent" style={{ fontSize: '11pt' }}>
        <Menu.Item as={Link} to={Routes.homepage()}>
            Variant Prioritization App
        </Menu.Item>
        {props.children}
    </Menu>
);
export default Navbar;
