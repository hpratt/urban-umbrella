import React from 'react';
import { createBrowserHistory } from 'history';
import { Route, Router, Switch } from 'react-router-dom';

import './App.css';
import { Routes } from './routes';

import { Navbar } from './components/navbar';
import { Homepage } from './components/homepage';
import { QTLPage } from './components/qtl';
import { TFBSPage } from './components/tfbs';
import { RDHSPage } from './components/re';

const h = createBrowserHistory();

const uri = "http://snps.staging.wenglab.org/graphql";
export const ClientContext = React.createContext(uri);

const App: React.FC = () => (
    <ClientContext.Provider value={uri}>
        <Router history={h}>
            <Switch>
                <Route exact path={Routes.homepage()}>
                    <Navbar />
                    <Homepage />
                </Route>
                <Route exact path={Routes.qtl()}>
                    <QTLPage />
                </Route>
                <Route exact path={Routes.tfbs()}>
                    <TFBSPage />
                </Route>
                <Route exact path={Routes.re()}>
                    <RDHSPage />
                </Route>
            </Switch>
        </Router>
    </ClientContext.Provider>
)
export default App;