import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FaChartLine, FaCog } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const UlComp = styled.ul`
  display: flex;
  border: 1px solid silver;
  border-radius: 10px;
  padding: 5px;
  width: fit-content;
`;
const LIComp = styled.li`
  padding: 10px;
  list-style: none;
  background-color: ${(props: IProps) => (props.activ ? '#e2f2f5' : 'white')};
  cursor: pointer;
  text-decoration: none;
  color: black;
`;

interface IPropsTabs {
  toggleSlippageModal(): any;
  main: {};
  liquidity: {};
  clearStates(): any;
  t: any;
  networkName: string;
}

interface IProps {
  activ: boolean;
}

export enum NETWORKS {
  BSC = 'BSC',
  AVAX = 'AVAX',
}

export const Tabs = (props: IPropsTabs) => {
  const [lp, setLp] = useState(false);
  const [swap, setSwap] = useState(true);
  const { t } = useTranslation('common');
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/liquidity') {
      setLp(true);
      setSwap(false);
    } else {
      setLp(false);
      setSwap(true);
    }
  }, []);

  const setActiveLp = () => {
    setLp(true);
    setSwap(false);
    props.clearStates();
  };

  const setActiveSwap = () => {
    setLp(false);
    setSwap(true);
  };

  const redirectChart = () => {
    if (props.networkName === NETWORKS.BSC) {
      window.open('/priceChart', '_blank');
    } else {
      window.open('/priceChart', '_blank');
    }
  };

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <UlComp>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <LIComp activ={swap} onClick={setActiveSwap}>
                {t('swap')}
              </LIComp>
            </Link>
            <Link to="/liquidity" style={{ textDecoration: 'none' }}>
              <LIComp activ={lp} onClick={setActiveLp}>
                {t('liquidity')}
              </LIComp>
            </Link>
            <div className="settings_chart" onClick={redirectChart}>
              <FaChartLine />
            </div>
            <div
              className="settings_slippage"
              onClick={props.toggleSlippageModal}
            >
              <FaCog />
            </div>
          </UlComp>
          {props.main}
        </Route>
        <Route path="/q/path/:id?:id?">
          <UlComp>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <LIComp activ={swap} onClick={setActiveSwap}>
                {t('swap')}
              </LIComp>
            </Link>
            <Link to="/liquidity" style={{ textDecoration: 'none' }}>
              <LIComp activ={lp} onClick={setActiveLp}>
                {t('liquidity')}
              </LIComp>
            </Link>
            <div className="settings_chart" onClick={redirectChart}>
              <FaChartLine />
            </div>
            <div
              className="settings_slippage"
              onClick={props.toggleSlippageModal}
            >
              <FaCog />
            </div>
          </UlComp>
          {props.main}
        </Route>
        <Route path="/liquidity">
          <UlComp>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <LIComp activ={swap} onClick={setActiveSwap}>
                {t('swap')}
              </LIComp>
            </Link>
            <Link to="/liquidity" style={{ textDecoration: 'none' }}>
              <LIComp activ={lp} onClick={setActiveLp}>
                {t('liquidity')}
              </LIComp>
            </Link>
            <div className="settings_chart" onClick={redirectChart}>
              <FaChartLine />
            </div>
            <div
              className="settings_slippage"
              onClick={props.toggleSlippageModal}
            >
              <FaCog />
            </div>
          </UlComp>
          {props.liquidity}
        </Route>
      </Switch>
    </Router>
  );
};
