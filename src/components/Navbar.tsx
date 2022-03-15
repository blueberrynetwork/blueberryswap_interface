import React, { Component } from 'react';
import styled from 'styled-components';
import logo from '../images/logo_blueberry_comp.png';
import Context from './Context';
import { HiDotsCircleHorizontal } from 'react-icons/hi';
import { FaWallet, FaSignOutAlt } from 'react-icons/fa';

const MenuContainer = styled.div`
  border: 0.5px solid #fff;
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
`;

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
  z-index: 2;
  font-size: 16px;
  cursor: pointer;
  @media only screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const AddressText = styled.div`
  color: white;
  padding-right: 5px;
`;

const TextNetWork = styled.div`
  padding-left: 5px;
  color: white;
  font-size: 16px;
  @media only screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const ContainerUl = styled.ul`
  display: flex;
  flex-direction: row;
  list-style: none;
  padding: 15px;
`;

const ContainerUlLogged = styled.ul`
  display: flex;
  flex-direction: row;
  list-style: none;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  margin-right: 25px;
`;
const DropDownList = styled.div`
  display: inline-block;
  border: 0.5px solid #fff;
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
`;

const Line = styled.hr`
  color: rgba(0, 0, 0, 0.65);
  width: 80%;
`;

const DropdownContentMenu = styled.div`
  position: absolute;
  background-color: #f9f9f9;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.3);
  padding: 12px 16px;
  z-index: 1;
  top: 4.1em;
  right: 1rem;
  @media only screen and (max-width: 600px) {
    top: 4.1em;
  }
`;

const ImageIcon25 = styled.img`
  height: 20px;
  width: 20px;
  vertical-align: sub;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0 3px 0 3px;
`;

const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px;
  color: white;
  font-size: 1.2rem;
`;

const LogoText = styled.div`
  @media only screen and (max-width: 600px) {
    display: none;
  }
`;

interface IProps {
  account: any;
  isPriceChart: boolean;
  toggleNetworkModal(): any;
  toggleLiquidityMigrate(): any;
  t: any;
  i18n: any;
}

interface IContext {
  context: any;
}

interface IState {
  dropDownMenuSelected: boolean;
  dropDownNetworkSelected: boolean;
}

export enum NETWORKS {
  BSC = 'BSC',
  AVAX = 'AVAX',
}

const BSC_ICON = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png';
const AVAX_ICON =
  'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png';

const BSC = () => (
  <div>
    <ImageIcon25 src={BSC_ICON} />
  </div>
);
const AVAX = () => (
  <div>
    <ImageIcon25 src={AVAX_ICON} />
  </div>
);

const Networks = (props: IContext) => {
  if (props.context.networkName === NETWORKS.BSC) {
    return <BSC />;
  } else if (props.context.networkName === NETWORKS.AVAX) {
    return <AVAX />;
  } else {
    return <div></div>;
  }
};
class Navbar extends Component<IProps, IState> {
  static contextType = Context;
  shortenAccount: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      dropDownMenuSelected: false,
      dropDownNetworkSelected: false,
    };
  }

  componentDidMount(): void {
    console.log(this.state.dropDownMenuSelected);
    if (this.state.dropDownMenuSelected) {
      document.removeEventListener('click', this.openMenu, false);
    }
  }

  openDropdown = () => {
    this.setState({
      dropDownNetworkSelected: !this.state.dropDownNetworkSelected,
      dropDownMenuSelected: false,
    });
  };

  openMenu = (e: any) => {
    this.setState({
      dropDownMenuSelected: !this.state.dropDownMenuSelected,
      dropDownNetworkSelected: false,
    });
  };

  setNetwork = async (network: string) => {
    if (network === NETWORKS.BSC) {
      await this.context.setNetwork('BSC', true);
    } else {
      this.context.setNetwork('AVAX', true);
    }
  };

  redirectURL = (input: string) => {
    switch (input) {
      case 'About':
        window.open('https://blueberry.network', '_blank');
        break;
      case 'theGraph':
        window.open(
          'https://thegraph.com/hosted-service/subgraph/blueberrynetwork/blueberryswap',
          '_blank'
        );
        break;
      case 'theGraph_avax':
        window.open(
          'https://thegraph.com/hosted-service/subgraph/blueberrynetwork/blueberry-network',
          '_blank'
        );
    }
  };

  render() {
    if (this.props.account) {
      const len = this.props.account.length;
      let accountFirstShorten = this.props.account.slice(0, 6);
      let accountSecondShorten = this.props.account.slice(len - 4, len);
      this.shortenAccount = `${accountFirstShorten}...${accountSecondShorten}`;
    }

    return (
      <NavbarContainer>
        <Logo
          as="a"
          href="https://blueberryswap.finance"
          style={{ textDecoration: 'none', color: 'white' }}
        >
          <img alt="logo" src={logo} height="60" />
          <LogoText>blueberryswap.finance</LogoText>
        </Logo>
        {!this.props.isPriceChart ? (
          <>
            {this.props.account ? (
              <>
                <ContainerUl>
                  <MenuItem>
                    <DropDownList onClick={this.openDropdown}>
                      <Item>
                        <Networks context={this.context} />
                        <TextNetWork>{this.context.networkName} </TextNetWork>
                      </Item>
                    </DropDownList>
                  </MenuItem>
                  <MenuItem>
                    <MenuContainer>
                      <Item>
                        <AddressText>{this.shortenAccount}</AddressText>
                        <FaSignOutAlt
                          size={20}
                          color="orange"
                          cursor="pointer"
                          onClick={this.context.disConnect}
                        ></FaSignOutAlt>
                      </Item>
                    </MenuContainer>
                  </MenuItem>
                  <MenuItem onClick={this.openMenu}>
                    <Item>
                      <HiDotsCircleHorizontal
                        size={35}
                        color="white"
                        cursor="pointer"
                      />
                    </Item>
                  </MenuItem>
                  {this.state.dropDownMenuSelected ? (
                    <DropdownContentMenu>
                      <Item onClick={() => this.redirectURL('About')}>
                        {this.props.t('about')}
                      </Item>
                      <Line />
                      <>
                        <Item onClick={this.props.toggleLiquidityMigrate}>
                          {this.props.t('migrator')}
                        </Item>
                        <Line />
                        <Item onClick={() => this.redirectURL('theGraph_avax')}>
                          theGraph
                        </Item>
                        <Line />
                      </>
                      <Item
                        onClick={() => this.props.i18n.changeLanguage('cn')}
                      >
                        简体中文
                      </Item>
                    </DropdownContentMenu>
                  ) : (
                    ''
                  )}
                </ContainerUl>
              </>
            ) : (
              <>
                <ContainerUlLogged>
                  <MenuItem>
                    <DropDownList onClick={this.openDropdown}>
                      <Item>
                        <Networks context={this.context} />
                        <TextNetWork>{this.context.networkName}</TextNetWork>
                      </Item>
                    </DropDownList>
                  </MenuItem>
                  <MenuItem onClick={this.context.connectToWeb3}>
                    <MenuContainer>
                      <Item>
                        <FaWallet size={20} color="white" cursor="pointer" />
                      </Item>
                      <Item>{this.props.t('connect')}</Item>
                    </MenuContainer>
                  </MenuItem>
                  <MenuItem onClick={this.openMenu}>
                    <Item>
                      <HiDotsCircleHorizontal
                        size={35}
                        color="white"
                        cursor="pointer"
                      />
                    </Item>
                  </MenuItem>
                  {this.state.dropDownMenuSelected ? (
                    <DropdownContentMenu>
                      <Item onClick={() => this.redirectURL('About')}>
                        {this.props.t('about')}
                      </Item>
                      <Line />
                      <>
                        <Item onClick={this.props.toggleLiquidityMigrate}>
                          {this.props.t('migrator')}
                        </Item>
                        <Line />
                        <Item onClick={() => this.redirectURL('theGraph_avax')}>
                          theGraph
                        </Item>
                        <Line />
                      </>
                      <Item
                        onClick={() => this.props.i18n.changeLanguage('cn')}
                      >
                        简体中文
                      </Item>
                    </DropdownContentMenu>
                  ) : (
                    ''
                  )}
                </ContainerUlLogged>
              </>
            )}
          </>
        ) : (
          ''
        )}
      </NavbarContainer>
    );
  }
}

export default Navbar;
