import React, { Component } from 'react';
import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address, getAddress } from '@ethersproject/address';
import './App.css';
import Navbar from './Navbar';
import SwapTokens from './SwapTokens';
import Web3 from 'web3';
import Exchange from '../abi/src/contracts/BlueberryExchange.sol/BlueberryExchange.json';
import Factory from '../abi/src/contracts/BlueberryFactory.sol/BlueberryFactory.json';
import Router from '../abi/src/contracts/BlueberryRouter.sol/BlueberryRouter.json';
import ERC20 from '../abi/src/contracts/BlueberryERC20.sol/BlueberryERC20.json';
import { BigNumber, ethers, Contract } from 'ethers';
import Context from './Context';
import { Modal } from '../components/Modalform';
import { IApp, ITokenData } from '../components/IStates/IApp';
import styled from 'styled-components';
import { Tabs } from './Tabs';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import AddLiquidity from './Liquidity';
import { Tokens } from '../data';
import whiteList from '../whiteList.json';
import { ModalSlippage } from './ModalSlippage';
import Web3Modal from 'web3modal';
import { BLOCKCHAIN_NETWORK, IBLOCKCHAIN_NETWORK } from './shared';
import { PriceChartContainer } from './PriceChartContainer';
import { Web3Auth } from './shared/web3Auth';
import { ModalFormTransaction } from './ModalFormTransaction';
import { ModalLiquidityMigrate } from './ModalLiquidityMigrate';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';

declare let window: any;

export enum NETWORKS {
  BSC_NAME = 'BSC',
  BSC_HEX = '0x38',
  AVAX_NAME = 'AVAX',
  AVAX_HEX = '0xa86a',
  WRONG_NETWORK = 'Wrong Network',
}

export enum TOKENSELECTED {
  BNB = 'BNB',
  AVAX = 'AVAX',
  BLUEBERRY = 'Blueberry',
}

const MsgInner = styled.div`
  position: relative;
  padding: 2px;
  border: 1px solid white;
  border-radius: 25px;
  height: 30px;
  min-height: 30px;
  margin: 10px;
  text-align: center;
  color: white;
  display: visible;
`;

class App extends Component<any, IApp> {
  _isMounted = false;
  child: any;
  refNav: any;
  web3Modal: Web3Modal;
  defaultProvider: any;
  provider: any;

  constructor(props: any) {
    super(props);
    this.child = React.createRef() || '';

    this.refNav = React.createRef() || '';

    //deactivate browser console
    window.console.log = function () {
      console.error('www.blueberry.network');
      window.console.log = function () {
        return false;
      };
    };

    this.state = {
      account: '',
      network: {},
      web3: new Web3(Web3.givenProvider),
      router: {} as Contract,
      factory: {} as Contract,
      exchange: {} as Contract,
      Pair: {} as Contract,
      tokenABalance: '0',
      tokenBBalance: '0',
      tokenABalanceInWei: BigNumber.from(0),
      tokenBBalanceInWei: BigNumber.from(0),
      loading: false,
      loadingRemoveLp: false,
      provider: {},
      signer: {},
      exchangeAddress: '',
      swapTokens: this.swapTokens,
      addLiquidity: this.addLiquidity,
      removeLiquidity: this.removeLiquidity,
      getTokenAAmount: this.getTokenAAmount,
      getTokenBAmount: this.getTokenBAmount,
      getLiquidityOwner: this.getLiquidityOwner,
      getPriceImpactAToken: this.getPriceImpactAToken,
      getPriceImpactBToken: this.getPriceImpactBToken,
      fromWei: this.fromWei,
      toWei: this.toWei,
      isOpen: false,
      isOpenModalSlippage: false,
      isOpenModalNetwork: false,
      isOpenModalTransaction: false,
      isOpenLiquidityMigrate: false,
      toggleSlippageModal: this.toggleSlippageModal,
      toggleTokenListModal: this.toggleTokenListModal,
      toggleNetworkModal: this.toggleNetworkModal,
      toggleLiquidityMigrate: this.toggleLiquidityMigrate,
      tokensData: [],
      tokenAData: {} as ITokenData,
      tokenBData: {} as ITokenData,
      setMsg: this.setMsg,
      msg: false,
      msgTxt: '',
      tx: '',
      outputAddress: '',
      liquidity: BigNumber,
      tokenASelectedShare: '',
      tokenBSelectedShare: '',
      lpPairBalanceAccount: '0',
      lpShareAccountviaInput: '0',
      priceImpact: '0',
      lpAccountShare: 0,
      tokenAShare: 0,
      tokenBShare: 0,
      tokenBSelected: false,
      outputAmount: '',
      outputAmountInWei: '',
      inputAmount: '',
      inputAmountInWei: '',
      setSlippage: this.setSlippage,
      slippage: '0.1',
      clearStates: this.clearStates,
      networkName: 'AVAX',
      correctNetwork: false,
      switched: false,
      connectToWeb3: this.connectToWeb3,
      web3Modal: {},
      isAddress: this.isAddress,
      pairAddress: '',
      replaceDigitsWithZeros: this.replaceDigitsWithZeros,
      whiteListUser: [],
      disConnect: this.disConnect,
      isPriceChart: false,
      checkInvestorShare: this.checkInvestorShare,
      calcMaxTransactionVal: 0,
      getBalances: this.getBalances,
      getInvestorShare: this.getInvestorShare,
      computePairAddress: this.computePairAddress,
      computePairAddressNoSort: this.computePairAddressNoSort,
      BLOCKCHAIN_NETWORK: {} as IBLOCKCHAIN_NETWORK,
      numberOfZeros: this.numberOfZeros,
      setNetwork: this.setNetwork,
    };
  }

  async componentDidMount() {
    this._isMounted = true;

    const nameOfNetwork = window.localStorage.getItem('networkName');

    const networkName = nameOfNetwork ? nameOfNetwork : this.state.networkName;

    const language = window.navigator.userLanguage || window.navigator.language;
    if (language === 'zh-CN') i18next.changeLanguage('cn');

    if (networkName === NETWORKS.WRONG_NETWORK) {
      this.setState({
        networkName,
      });
    } else {
      this.setState({
        BLOCKCHAIN_NETWORK,
        tokensData: Tokens[networkName],
        tokenAData: Tokens[networkName][0],
        tokenBData: Tokens[networkName][1],
        whiteListUser: whiteList,
        networkName,
      });
    }
    const path = window.location.pathname;

    if (path !== '/priceChart') {
      await this.init(networkName);
      if (this.web3Modal.cachedProvider) {
        await this.setNetwork(networkName, false);
      } else {
        if (this.state.networkName === NETWORKS.AVAX_NAME) {
          const url = 'https://api.avax.network/ext/bc/C/rpc';
          this.defaultProvider = new ethers.providers.JsonRpcProvider(url, {
            name: 'avax',
            chainId: 43114,
          });
          await this.loadBlockchainData();
        } else {
          const url = 'https://bsc-dataseed.binance.org/';
          this.defaultProvider = new ethers.providers.JsonRpcProvider(url, {
            name: 'binance',
            chainId: 56,
          });
          await this.loadBlockchainData();
        }
      }
      await this.setBrowserUrl();
    } else {
      this.setState({
        isPriceChart: true,
      });
    }
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.account !== this.state.account) {
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    }
  }
  // add 10%
  calculateGasMargin(value: BigNumber): BigNumber {
    return value
      .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
      .div(BigNumber.from(10000));
  }

  setBrowserUrl = async () => {
    const browserUrl = window.location.pathname;
    const base = browserUrl.split('=');

    const input_token = base[1];
    const output_token = base[3];
    if (this.state.networkName !== NETWORKS.WRONG_NETWORK) {
      const tokenAData = await this.lookUpAddress(
        Tokens[this.state.networkName],
        input_token
      );
      const tokenBData = await this.lookUpAddress(
        Tokens[this.state.networkName],
        output_token
      );
      const tokenADataObj = tokenAData[0];
      const tokenBDataObj = tokenBData[0];

      if (tokenADataObj && tokenBDataObj) {
        this.getTokenAData(tokenADataObj, false);
        this.getTokenBData(tokenBDataObj, false);
      } else if (tokenADataObj) {
        this.getTokenAData(tokenADataObj, false);
      } else if (tokenBDataObj) {
        this.getTokenBData(tokenBDataObj, false);
      }
    }
  };
  lookUpAddress = async (data: ITokenData[], address: any) => {
    return data.filter((item: ITokenData) => {
      return item.address === address;
    });
  };

  init = async (networkName: string) => {
    try {
      ({ web3Modal: this.web3Modal } = await Web3Auth.init(networkName));
    } catch (err: any) {
      console.log(err);
    }
  };

  connectToWeb3 = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let web3: any;
    let provider: any;
    let accounts: any;
    let network: any;

    if (isMobile) {
      ({ web3, provider, accounts, network } = await Web3Auth.connect());
      // Subscribe to chainId change
      provider.on('chainChanged', async (chainId: number) => {
        console.log('chainChanged..');

        let networkName: any;
        [networkName] = await this.getNetworkName(chainId.toString());
        this.setNetwork(networkName, true);
      });

      // Subscribe to provider connection
      provider.on('connect', (info: { chainId: number }) => {
        console.log('connect over mobile..');
      });

      // Subscribe to provider disconnection
      provider.on('disconnect', (error: { code: number; message: string }) => {
        this.web3Modal.clearCachedProvider();
        localStorage.clear();
        console.log(error);
      });

      provider.on('accountsChanged', async (accounts: any) => {
        // Time to reload your interface with accounts[0]!
        console.log('Account changed..');

        this.setState({
          account: accounts[0],
        });

        await this.getBalances();
      });
    } else {
      await this.switchNetworks(this.state.networkName);
      ({ web3, provider, accounts, network } = await Web3Auth.connect());
      // Subscribe to chainId change
      window.ethereum.on('chainChanged', async (chainId: number) => {
        console.log('chainChanged..');
        console.log(chainId);

        let networkName: any;
        [networkName] = await this.getNetworkName(chainId.toString());

        this.setNetwork(networkName, true);
      });

      // Subscribe to provider connection
      window.ethereum.on('connect', (info: { chainId: number }) => {
        console.log('connect..');
        console.log(info);
      });

      // Subscribe to provider disconnection
      window.ethereum.on(
        'disconnect',
        (error: { code: number; message: string }) => {
          this.web3Modal.clearCachedProvider();
          localStorage.clear();
          console.log(error);
        }
      );

      window.ethereum.on('accountsChanged', async (accounts: any) => {
        // Time to reload your interface with accounts[0]!
        console.log('Account changed..');

        this.setState({
          account: accounts[0],
        });

        await this.getBalances();
      });
    }

    const signer = provider.getSigner();

    const networkDetected = await this.getNetworkName(
      network.chainId.toString()
    );

    this.setState({
      web3,
      provider,
      signer,
      account: accounts[0],
      networkName: networkDetected[0].toString(),
    });
    await this.loadBlockchainData();
    await this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
  };

  disConnect = async () => {
    try {
      console.log('disconnect...');
      this.web3Modal.clearCachedProvider();
      localStorage.clear();
      window.location.reload(true);
    } catch (e: any) {
      console.log(e);
    }
  };

  async loadBlockchainData() {
    console.log('loadBlockchainData..');

    let networkName: any, correctNetwork: any;

    [networkName, correctNetwork] = await this.getNetworkName(
      this.state.networkName
    );

    if (correctNetwork && this.state.network !== NETWORKS.WRONG_NETWORK) {
      try {
        const provider = this.isObjectEmpty(this.state.signer)
          ? this.defaultProvider
          : this.state.signer;

        if (correctNetwork || this.defaultProvider) {
          //Router load
          const router = new ethers.Contract(
            this.isAddress(
              this.state.BLOCKCHAIN_NETWORK[this.state.networkName]
                .ROUTER_ADDRESS
            ),
            Router.abi,
            provider
          );

          //Factory load
          const factory = new ethers.Contract(
            this.state.BLOCKCHAIN_NETWORK[
              this.state.networkName
            ].FACTORY_ADDRESS,
            Factory.abi,
            provider
          );

          this.setState({
            router,
            factory,
            networkName,
            correctNetwork,
          });
        } else {
          console.log('Wrong network');
          this.setState({
            networkName,
            loading: false,
          });
        }
        await this.getBalances();
      } catch (e: any) {
        console.log(e);
      }
    } else {
      console.log('Wrong Network');
    }
  }

  refreshPage = async () => {
    await window.location.reload();
  };
  getBalances = async () => {
    console.log('getBalances..');
    if (this.state.account) {
      if (
        this.state.tokenAData?.address ===
        this.isAddress(
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].WETH_ADDRESS
        )
      ) {
        await this.getEthBalanceTokenA();
        this.getTokenBBalance();
      } else if (
        this.state.tokenBData?.address ===
        this.isAddress(
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].WETH_ADDRESS
        )
      ) {
        await this.getEthBalanceTokenB();
        this.getTokenABalance();
      } else {
        this.getTokenABalance();
        this.getTokenBBalance();
      }
    }
  };

  getGasLimit = async () => {
    const gasLimit = await this.state.web3.eth.getBlock('latest');
    return gasLimit;
  };

  isAddress(value: any): string {
    try {
      return getAddress(value);
    } catch {
      return null;
    }
  }

  replaceDigitsWithZeros = async (inputAmount: any) => {
    if (inputAmount.split('.')[0].toString().length > 10) {
      inputAmount = await this.replaceLast3And6DigitsWithZero(inputAmount, 7);
    } else if (
      inputAmount.split('.')[0].toString().length > 6 &&
      inputAmount.split('.')[0].toString().length < 10
    ) {
      inputAmount = await this.replaceLast3And6DigitsWithZero(inputAmount, 3);
    }
    return inputAmount;
  };

  replaceLast3And6DigitsWithZero = async (input: any, replaceNum: number) => {
    input = input.split('.')[0];
    input = input.split('');
    let num = replaceNum;
    let len = input.length - 1;

    while (num > 0) {
      input[len] = 0;
      len--;
      num--;
    }

    return input.join('');
  };

  computePairAddress = async (
    factoryAddress: any,
    tokenA: ITokenData,
    tokenB: ITokenData
  ) => {
    const [token0, token1] =
      tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
        ? [tokenA.address, tokenB.address]
        : [tokenB.address, tokenA.address];
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
      this.state.BLOCKCHAIN_NETWORK[this.state.networkName].INIT_CODE_HASH
    );
  };

  computePairAddressNoSort = async (
    factoryAddress: any,
    tokenA: ITokenData,
    tokenB: ITokenData
  ) => {
    return getCreate2Address(
      factoryAddress,
      keccak256(
        ['bytes'],
        [pack(['address', 'address'], [tokenA.address, tokenB.address])]
      ),
      this.state.BLOCKCHAIN_NETWORK[this.state.networkName].INIT_CODE_HASH
    );
  };

  // clear at switching taps or removing input
  clearStates = async () => {
    this.setState({
      priceImpact: '0',
      inputAmount: null,
      outputAmount: null,
      outputAmountInWei: null,
      inputAmountInWei: null,
      pairAddress: '',
    });
  };

  setSlippage = (slippage: string) => {
    console.log(`setSlippage...${slippage}`);
    if (Number.parseFloat(slippage) > 20) {
      return false;
    }
    this.setState({
      slippage,
    });
    return true;
  };

  setTokensDefault = async (networkName: string) => {
    console.log(networkName);

    if (networkName === NETWORKS.WRONG_NETWORK) {
      this.setState({
        networkName,
      });
    } else {
      this.setState({
        tokenAData: Tokens[networkName][0],
        tokenBData: Tokens[networkName][1],
        tokensData: Tokens[networkName],
        networkName,
      });
    }
  };

  switchNetworks = async (networkName: string) => {
    if (networkName === NETWORKS.BSC_NAME || networkName === NETWORKS.BSC_HEX) {
      await Web3Auth.addNetworkBSC();
    } else {
      await Web3Auth.addNetworkAVAX();
    }
  };

  setNetwork = async (networkName: string, clearCache: boolean) => {
    console.log('setNetwork..');

    if (
      networkName === NETWORKS.AVAX_NAME ||
      networkName === NETWORKS.AVAX_HEX
    ) {
      await this.disableNetworkModal();
      if (clearCache) this.web3Modal.clearCachedProvider();
      await this.setTokensDefault(networkName);
      await this.init('AVAX');
      window.localStorage.setItem('networkName', 'AVAX');
      await this.connectToWeb3();
    }

    this.setState({
      networkName,
    });

    await this.loadBlockchainData();
  };

  switchForms = async () => {
    console.log('switchForms..');
    await this.switchTokens();
  };

  switchTokens = async () => {
    const tokenADataTmp = this.state.tokenAData;
    const balanceATmp = this.state.tokenABalance;
    const balanceATmpInWei = this.state.toWei(
      balanceATmp,
      this.state.tokenAData.decimals
    );

    this.setState({
      tokenAData: this.state.tokenBData,
      tokenBData: tokenADataTmp,
      tokenABalance: this.state.tokenBBalance,
      tokenBBalance: balanceATmp,
      tokenABalanceInWei: this.state.tokenBBalanceInWei,
      tokenBBalanceInWei: balanceATmpInWei,
      switched: !this.state.switched,
    });
  };

  isObjectEmpty = (obj: any) => {
    return Object.keys(obj).length === 0 || Object.keys(obj).length === null;
  };

  getCalcExchangeAddress = async (tokenA: ITokenData, tokenB: ITokenData) => {
    if (this.state.networkName !== NETWORKS.WRONG_NETWORK) {
      const FACTORY_ADDRESS_NEW = this.isAddress(
        this.state.BLOCKCHAIN_NETWORK[this.state.networkName].FACTORY_ADDRESS
      );
      return this.computePairAddress(FACTORY_ADDRESS_NEW, tokenA, tokenB);
    }
    return;
  };

  getNetworkName = async (network: string) => {
    console.log(network);
    switch (network) {
      case 'AVAX':
      case '0xa86a':
      case '43114':
        return ['AVAX', true];
      default:
        return ['Wrong Network', false];
    }
  };

  toWei(value: string, decimals: number) {
    return ethers.utils.parseUnits(value.toString(), decimals);
  }

  fromWei(value: any, decimals: number) {
    return ethers.utils.formatUnits(
      typeof value === 'string' ? value : value.toString(),
      decimals
    );
  }

  async getEthBalanceTokenA() {
    try {
      let ethBalance: any, ethBalanceInWei: BigNumber;
      if (this.state.account) {
        ethBalanceInWei = await this.state.provider.getBalance(
          this.state.account
        );

        ethBalance = this.fromWei(
          ethBalanceInWei,
          this.state.tokenAData.decimals
        );
        ethBalance = Number.parseFloat(ethBalance).toFixed(3);

        this.setState({
          tokenABalance: ethBalance,
          tokenABalanceInWei: ethBalanceInWei,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getEthBalanceTokenB() {
    try {
      if (this.state.account) {
        let ethBalance: any, ethBalanceInWei: BigNumber;
        ethBalanceInWei = await this.state.provider.getBalance(
          this.state.account
        );
        ethBalance = this.fromWei(
          ethBalanceInWei,
          this.state.tokenBData.decimals
        );
        ethBalance = Number.parseFloat(ethBalance).toFixed(3);

        this.setState({
          tokenBBalance: ethBalance,
          tokenBBalanceInWei: ethBalanceInWei,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getTokenABalance() {
    try {
      if (this.state.tokenAData && !this.isObjectEmpty(this.state.tokenAData)) {
        const provider = this.isObjectEmpty(this.state.signer)
          ? this.defaultProvider
          : this.state.signer;

        const token1 = new ethers.Contract(
          this.state.tokenAData.address,
          ERC20.abi,
          provider
        );

        let tokenABalance: any, tokenABalanceInWei: any;
        tokenABalanceInWei = await token1.balanceOf(this.state.account);
        tokenABalance = this.fromWei(
          tokenABalanceInWei,
          this.state.tokenAData.decimals
        );
        tokenABalance = Number.parseFloat(tokenABalance).toFixed(3);

        this.setState({ tokenABalance, tokenABalanceInWei });
      }
    } catch (err) {
      console.log(err);
      this.setState({ tokenABalance: '0' });
    }
  }

  async getTokenBBalance() {
    try {
      if (this.state.tokenBData && !this.isObjectEmpty(this.state.tokenBData)) {
        const provider = this.isObjectEmpty(this.state.signer)
          ? this.defaultProvider
          : this.state.signer;

        const token2 = new ethers.Contract(
          this.state.tokenBData.address,
          ERC20.abi,
          provider
        );

        let tokenBBalance: any, tokenBBalanceInWei: any;
        tokenBBalanceInWei = await token2.balanceOf(this.state.account);

        tokenBBalance = this.fromWei(
          tokenBBalanceInWei,
          this.state.tokenBData.decimals
        );

        tokenBBalance = Number.parseFloat(tokenBBalance).toFixed(3);

        this.setState({ tokenBBalance, tokenBBalanceInWei });
      }
    } catch (err) {
      console.log(err);
      this.setState({ tokenBBalance: '0' });
    }
  }

  checkIfBothTokeSelected = async (withMessage: boolean) => {
    if (
      this.state.tokenAData &&
      Object.keys(this.state.tokenAData).length > 0 &&
      this.state.tokenBData &&
      Object.keys(this.state.tokenBData).length > 0
    ) {
      return true;
    } else {
      if (withMessage) {
        console.log('Select a token..');
        this.setMsg('Select a token..');
      }
      this.setState({
        loading: false,
      });
    }
  };

  getInvestorShare = async (liquidityProvider: boolean) => {
    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;

    if (!this.isObjectEmpty(provider)) {
      const token = new ethers.Contract(
        this.state.BLOCKCHAIN_NETWORK[this.state.networkName].BLUEBERRY_ADDRESS,
        ERC20.abi,
        provider
      );

      let tokenSupply = await token.totalSupply();
      tokenSupply = this.fromWei(tokenSupply, 18);

      let calcMaxTransactionVal = Number.parseInt(tokenSupply) * 0.005;
      calcMaxTransactionVal = Number.parseInt(calcMaxTransactionVal.toFixed(2));

      return calcMaxTransactionVal;
    }
  };

  checkInvestorShare = async (liquidityProvider: boolean, input?: any) => {
    console.log('checkInvestorShare..');

    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;

    const whiteListed = await this.checkIfAccountIsWhitelisted();

    if (!liquidityProvider || whiteListed) {
      return true;
    }

    const token = new ethers.Contract(
      this.state.BLOCKCHAIN_NETWORK[this.state.networkName].BLUEBERRY_ADDRESS,
      ERC20.abi,
      provider
    );

    let tokenSupply = await token.totalSupply();
    tokenSupply = this.fromWei(tokenSupply, 18);

    let balanceOfUser = await token.balanceOf(this.state.account);
    balanceOfUser = this.fromWei(balanceOfUser, 18);
    const amount = this.fromWei(input, 18);

    const balancePlusTrade =
      Number.parseInt(balanceOfUser) + Number.parseInt(amount);
    let calcMaxTransactionVal = Number.parseInt(tokenSupply) * 0.005;
    calcMaxTransactionVal = Number.parseInt(calcMaxTransactionVal.toFixed(2));

    let calcPercentInputPercent =
      (Number.parseInt(amount) / Number.parseInt(tokenSupply)) * 100;
    calcPercentInputPercent = calcPercentInputPercent * 1000;
    calcPercentInputPercent = Number.parseInt(
      calcPercentInputPercent.toFixed()
    );

    let calcPercent = (balancePlusTrade / Number.parseInt(tokenSupply)) * 100;

    calcPercent = calcPercent * 1000;
    calcPercent = Number.parseInt(calcPercent.toFixed());

    if (calcPercentInputPercent > 500) {
      console.log(`Max allowed transaction is: ${calcMaxTransactionVal}`);
      this.setMsg(`Max allowed transaction is: ${calcMaxTransactionVal}`);
      return false;
    }

    const WHITELIST = [
      '0x8eff704b42819a052f03b3d48d9b0fde0a9198ef',
      '0x2f1fa2577c159cff93ec59fd0afe35a657867b25',
      '0x0294d508987430cccdb541c77c9e012dd9f70888',
      '0xc6632a94b38866599c00f29581d0b2608905f098',
      '0x8231bbaf339edf305391648017c62b0ed9e33bca',
      '0x4a7d0a13786881125e56cdfdb3b44cf747dcb4cf',
      '0xb8397d14a2c1168b244322fd1b977473180df137',
      '0xc5923b195f4a6c2eb92e41620696b8f916e30cbb',
      '0xf0a565fc2f9a78cfdacf167091f11aca91109912',
      '0x1ee1d1c4d0996b42992af26382bd82182d27ed59',
      '0x2e825c10a6a353e281d7da87c182e947099af185',
      '0x0d993b455a2190d914a92c97f96fa50a55d7bb5b',
    ];

    if (
      this.state.tokenAData.name === TOKENSELECTED.AVAX &&
      calcPercent <= 1000 + calcPercentInputPercent
    ) {
      return true;
    } else if (
      (this.state.tokenAData.name === TOKENSELECTED.BLUEBERRY &&
        calcPercentInputPercent < 500) ||
      WHITELIST.includes(this.state.account)
    ) {
      return true;
    } else {
      console.log('Allowed max share 1% and max tx 0.5%');
      this.setMsg('Allowed max share 1% and max tx 0.5%');
      return false;
    }
  };

  checkBalances = async (tokenAAmount: BigNumber, tokenBAmount: BigNumber) => {
    if (this.state.tokenABalanceInWei.gte(tokenAAmount)) {
      return true;
    } else {
      console.log('Not enough balance');
      this.setMsg('Not enough balance..');
      this.setState({
        loading: false,
      });
    }
  };

  checkValueInputs = async (
    tokenAAmount: BigNumber,
    tokenBAmount: BigNumber
  ) => {
    if (tokenAAmount.gt(0) && tokenBAmount.gt(0)) {
      return true;
    } else {
      console.log('Input fields must not be empty');
      this.setMsg('Input fields must not be empty');
      this.setState({
        loading: false,
      });
    }
  };

  checkIfAccountIsWhitelisted = async () => {
    const whiteListed = this.state.whiteListUser.includes(this.state.account);
    return whiteListed;
  };
  checkAllFieldInputs = async (
    tokenAAmount: BigNumber,
    tokenBAmount: BigNumber,
    liquidityProvider: boolean
  ) => {
    console.log('checkAllInputs...');
    const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
    const checkBalances = await this.checkBalances(tokenAAmount, tokenBAmount);
    const checkValueInputs = await this.checkValueInputs(
      tokenAAmount,
      tokenBAmount
    );

    let investorShare: any;
    if (this.state.networkName === NETWORKS.AVAX_NAME) {
      if (!this.state.switched) {
        investorShare = await this.checkInvestorShare(
          liquidityProvider,
          tokenBAmount
        );
      } else {
        investorShare = await this.checkInvestorShare(
          liquidityProvider,
          tokenAAmount
        );
      }
    } else {
      investorShare = true;
    }

    return (
      checkSelectedTokens && checkBalances && checkValueInputs && investorShare
    );
  };

  delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

  openTransactionModal = async (tx2: any) => {
    this.setState({
      loading: false,
      tx: tx2.hash,
      isOpenModalTransaction: !this.state.isOpenModalTransaction,
    });
  };

  addLiquidity = async (tokenAAmount: any, tokenBAmount: any) => {
    this.setState({ loading: true });
    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;

    const checkInputs = await this.checkAllFieldInputs(
      tokenAAmount,
      tokenBAmount,
      false
    );
    if (checkInputs) {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      console.log(`Pair Address - àddLiquidity : ${this.state.pairAddress}`);

      let gasPrice = await this.state.provider.getGasPrice();
      console.log(`gasPrice: ${gasPrice}`);
      console.log(
        `gasLimit: ${
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].OVERRIDES
            .gasLimit
        }}`
      );
      if (
        this.state.tokenAData.address ===
        this.isAddress(
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].WETH_ADDRESS
        )
      ) {
        try {
          console.log('Adding liquditiy ETH now ...');

          const token2 = new ethers.Contract(
            this.state.tokenBData.address,
            ERC20.abi,
            provider
          );

          const gasLimitApprove = await token2
            .connect(this.state.signer)
            .estimateGas.approve(this.state.router.address, tokenBAmount, {
              from: this.state.account,
            });

          const tx = await token2
            .connect(this.state.signer)
            .approve(this.state.router.address, tokenBAmount, {
              from: this.state.account,
              gasLimit: this.calculateGasMargin(gasLimitApprove),
            });

          await tx.wait();

          let gasLimit = await this.state.router
            .connect(this.state.signer)
            .estimateGas.addLiquidityETH(
              this.state.tokenBData.address,
              tokenBAmount, //TokenB
              0,
              0,
              this.state.account,
              deadline,
              {
                from: this.state.account,
                value: tokenAAmount, //ETH
              }
            );

          const tx2 = await this.state.router.addLiquidityETH(
            this.state.tokenBData.address,
            tokenBAmount, //TokenB
            0,
            0,
            this.state.account,
            deadline,
            {
              from: this.state.account,
              value: tokenAAmount, //ETH
              gasLimit: this.calculateGasMargin(gasLimit),
            }
          );
          await this.delay(3000);

          this.setState({
            loading: false,
            tx: tx2.hash,
            isOpenModalTransaction: !this.state.isOpenModalTransaction,
          });
        } catch (err) {
          this.setState({ loading: false });
        }
      } else if (
        this.state.tokenBData.address ===
        this.isAddress(
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].WETH_ADDRESS
        )
      ) {
        try {
          console.log('Adding liquditiy Token to ETH now ...');

          const token1 = new ethers.Contract(
            this.state.tokenAData.address,
            ERC20.abi,
            provider
          );

          const gasLimitApprove = await token1
            .connect(this.state.signer)
            .estimateGas.approve(this.state.router.address, tokenAAmount, {
              from: this.state.account,
            });

          const tx = await token1
            .connect(this.state.signer)
            .approve(this.state.router.address, tokenAAmount, {
              from: this.state.account,
              gasPrice,
              gasLimit: gasLimitApprove,
            });
          await tx.wait();

          let gasLimit = await this.state.router
            .connect(this.state.signer)
            .estimateGas.addLiquidityETH(
              this.state.tokenAData.address,
              tokenAAmount, //TokenA
              0,
              0,
              this.state.account,
              deadline,
              {
                from: this.state.account,
                value: tokenBAmount, //ETH
              }
            );

          const tx2 = await this.state.router
            .connect(this.state.signer)
            .addLiquidityETH(
              this.state.tokenAData.address,
              tokenAAmount, //TokenA
              0,
              0,
              this.state.account,
              deadline,
              {
                from: this.state.account,
                value: tokenBAmount, //ETH
                gasLimit: this.calculateGasMargin(gasLimit),
              }
            );
          await tx2.wait();

          this.setState({ loading: false, tx: tx2.hash });
          setTimeout(() => {
            this.setState({ tx: null });
          }, 3000);
        } catch (err) {
          this.setState({ loading: false });
        }
      } else {
        try {
          console.log('Adding liquditiy Token to Token now ...');

          const token1 = new ethers.Contract(
            this.state.tokenAData.address,
            ERC20.abi,
            provider
          );

          const token2 = new ethers.Contract(
            this.state.tokenBData.address,
            ERC20.abi,
            provider
          );

          const gasLimitApprove = await token1
            .connect(this.state.signer)
            .estimateGas.approve(this.state.router.address, tokenAAmount, {
              from: this.state.account,
            });

          const tx0 = await token1
            .connect(this.state.signer)
            .approve(this.state.router.address, tokenAAmount, {
              from: this.state.account,
              gasLimit: this.calculateGasMargin(gasLimitApprove),
            });
          await tx0.wait();

          const tx1 = await token2.approve(
            this.state.router.connect(this.state.signer).address,
            tokenBAmount,
            {
              from: this.state.account,
              gasLimit: this.calculateGasMargin(gasLimitApprove),
            }
          );

          await tx1.await();

          let gasLimit = await this.state.router
            .connect(this.state.signer)
            .estimateGas.addLiquidity(
              this.state.tokenAData.address,
              this.state.tokenBData.address,
              tokenAAmount,
              tokenBAmount,
              0,
              0,
              this.state.account,
              deadline,
              {
                from: this.state.account,
              }
            );

          const tx2 = await this.state.router
            .connect(this.state.signer)
            .addLiquidity(
              this.state.tokenAData.address,
              this.state.tokenBData.address,
              tokenAAmount,
              tokenBAmount,
              0,
              0,
              this.state.account,
              deadline,
              {
                from: this.state.account,
                gasLimit: this.calculateGasMargin(gasLimit),
              }
            );
          await this.delay(3000);

          this.setState({ loading: false, tx: tx2.hash });
          setTimeout(() => {
            this.setState({ tx: null });
          }, 3000);
        } catch (err) {
          this.setState({ loading: false });
        }
      }
    }
  };

  removeLiquidity = async (liquidityAmount: any) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;

    const pairAddress = await this.getCalcExchangeAddress(
      this.state.tokenAData,
      this.state.tokenBData
    );

    const Pair = new ethers.Contract(pairAddress, Exchange.abi, provider);

    const liquidity = await Pair.balanceOf(this.state.account);

    try {
      const gasPrice = await this.state.provider.getGasPrice();
      console.log(`gasPrice: ${gasPrice}`);
      console.log(
        `gasLimit: ${
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].OVERRIDES
            .gasLimit
        }`
      );
      console.log(liquidity);

      const gasLimitApprove = await this.state.Pair.estimateGas.approve(
        this.state.router.address,
        liquidityAmount,
        {
          from: this.state.account,
        }
      );

      const tx1 = await this.state.Pair.approve(
        this.state.router.address,
        liquidityAmount,
        {
          from: this.state.account,
          gasLimit: this.calculateGasMargin(gasLimitApprove),
        }
      );
      await tx1.wait();

      let gasLimit = await this.state.router
        .connect(this.state.signer)
        .estimateGas.removeLiquidityETHSupportingFeeOnTransferTokens(
          this.state.tokenBData.address,
          liquidityAmount,
          0,
          0,
          this.state.account,
          deadline,
          {
            from: this.state.account,
          }
        );

      const tx2 = await this.state.router
        .connect(this.state.signer)
        .removeLiquidityETHSupportingFeeOnTransferTokens(
          this.state.tokenBData.address,
          liquidityAmount,
          0,
          0,
          this.state.account,
          deadline,
          {
            from: this.state.account,
            gasLimit: this.calculateGasMargin(gasLimit),
          }
        );

      await this.delay(3000);

      setTimeout(() => {
        this.setState({
          loading: false,
          tx: tx2.hash,
          isOpenModalTransaction: !this.state.isOpenModalTransaction,
        });
      }, 1000);
    } catch (e: any) {
      console.log(e);
      console.log('Could not remove liquidity');
    }
  };

  swapTokens = async (tokenAAmount: BigNumber, tokenBAmount: BigNumber) => {
    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;

    const checkInputs = await this.checkAllFieldInputs(
      tokenAAmount,
      tokenBAmount,
      true
    );
    if (checkInputs) {
      //slippages
      const slippage = 1000 - (this.state.slippage * 1000) / 100;

      const _minTokens = BigNumber.from(tokenBAmount).mul(slippage).div(1000);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      console.log(`Token pair - swapTokens..`);

      const token1 = new ethers.Contract(
        this.state.tokenAData.address,
        ERC20.abi,
        provider
      );

      const token2 = new ethers.Contract(
        this.state.tokenBData.address,
        ERC20.abi,
        provider
      );

      if (
        this.state.tokenAData.address ===
        this.isAddress(
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].WETH_ADDRESS
        )
      ) {
        console.log(`swapExactETHForTokensSupportingFeeOnTransferTokens..`);

        try {
          let gasLimit = await this.state.router
            .connect(this.state.signer)
            .estimateGas.swapExactETHForTokensSupportingFeeOnTransferTokens(
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
                value: tokenAAmount,
                from: this.state.account,
              }
            );

          const tx = await this.state.router
            .connect(this.state.signer)
            .swapExactETHForTokensSupportingFeeOnTransferTokens(
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
                value: tokenAAmount,
                from: this.state.account,
                gasLimit: this.calculateGasMargin(gasLimit),
              }
            );
          await this.delay(3000);
          this.setState({
            loading: false,
            tx: tx.hash,
            isOpenModalTransaction: !this.state.isOpenModalTransaction,
          });
        } catch (err) {
          console.log(
            `swapExactETHForTokensSupportingFeeOnTransferTokens failed ${err}`
          );
          if (err.code === -32603) {
            this.setMsg('Set your slippage tolerance to 10%+');
          }
          this.setState({ loading: false });
        }
      } else if (
        this.state.tokenBData.address ===
        this.isAddress(
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].WETH_ADDRESS
        )
      ) {
        console.log('swapExactTokensForETHSupportingFeeOnTransferTokens..');

        try {
          const gasLimitApprove = await token1.estimateGas.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
            }
          );

          const tx0 = await token1.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              gasLimit: this.calculateGasMargin(gasLimitApprove),
            }
          );
          await tx0.wait();

          let gasLimit = await this.state.router
            .connect(this.state.signer)
            .estimateGas.swapExactTokensForETHSupportingFeeOnTransferTokens(
              tokenAAmount,
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
                from: this.state.account,
              }
            );

          const tx = await this.state.router
            .connect(this.state.signer)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(
              tokenAAmount,
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
                from: this.state.account,
                gasLimit: this.calculateGasMargin(gasLimit),
              }
            );

          await this.delay(3000);
          this.setState({
            loading: false,
            tx: tx.hash,
            isOpenModalTransaction: !this.state.isOpenModalTransaction,
          });
        } catch (err) {
          if (err.code === -32603) {
            this.setMsg('Set your slippage tolerance to 10%+');
          }
          console.log(
            `swapExactTokensForETHSupportingFeeOnTransferTokens failed ${err}`
          );
          this.setState({ loading: false });
        }
      } else {
        console.log('swapExactTokensForTokensSupportingFeeOnTransferTokens');

        try {
          const gasLimitApprove = await token1.estimateGas.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
            }
          );
          const tx0 = await token1.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
            }
          );
          await tx0.wait();

          const tx1 = await token2.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              gasLimit: this.calculateGasMargin(gasLimitApprove),
            }
          );
          await tx1.wait();

          let gasLimit = await this.state.router
            .connect(this.state.signer)
            .estimateGas.swapExactTokensForTokensSupportingFeeOnTransferTokens(
              tokenAAmount,
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
                from: this.state.account,
              }
            );

          const tx = await this.state.router
            .connect(this.state.signer)
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
              tokenAAmount,
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
                from: this.state.account,
                gasLimit: this.calculateGasMargin(gasLimit),
              }
            );
          await this.delay(3000);
          this.setState({
            loading: false,
            tx: tx.hash,
            isOpenModalTransaction: !this.state.isOpenModalTransaction,
          });
        } catch (err) {
          if (err.code === -32603) {
            this.setMsg('Set your slippage tolerance to 10%+');
          }
          console.log(
            `swapExactTokensForTokensSupportingFeeOnTransferTokens failed ${err}`
          );
          this.setState({ loading: false });
        }
      }
    }
  };

  checkIfpairAddressExists = async () => {
    try {
      const provider = this.isObjectEmpty(this.state.signer)
        ? this.defaultProvider
        : this.state.signer;

      const pairAddress = await this.getCalcExchangeAddress(
        this.state.tokenAData,
        this.state.tokenBData
      );

      const pairContract = new ethers.Contract(
        pairAddress,
        Exchange.abi,
        provider
      );

      const reserves = await pairContract.getReserves();

      const [reserve0, reserve1] = reserves;

      const reserveCalc = BigNumber.from(reserve0).add(
        BigNumber.from(reserve1)
      );

      if (BigNumber.from(reserveCalc).gt(0)) {
        this.setState({
          pairAddress,
        });
      }
      return reserveCalc;
    } catch (err: any) {
      console.log('Error:');
      console.log(err.toString());
    }
  };

  getTokenAAmount = async (tokenAmount: BigNumber) => {
    console.log('getTokenAAmount...');
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      const checkSelectedTokens = await this.checkIfBothTokeSelected(true);

      if (checkSelectedTokens) {
        const reserveCalc: BigNumber = await this.checkIfpairAddressExists();

        console.log(
          `Pair address - getTokenAAmount: ${this.state.pairAddress}`
        );

        if (reserveCalc && reserveCalc.gt(0)) {
          if (BigNumber.from(tokenAmount).gt(0)) {
            let res = await this._getTokenAmountIn(tokenAmount);

            if (!res) {
              console.log('Price impact is to high...');
              this.setMsg('Price impact is to high...');
              this.setState({
                priceImpact: '100',
              });
              return;
            }

            return res[0].toString();
          } else {
            console.log('TokenAmount is undefined..');
          }
        } else {
          console.log('No Pair exists..');
          this.setMsg('No Pair exists..');
          if (this.child?.current) {
            await this.child.current.resetFormFields();
          }
        }
      } else {
        console.log('getTokenAAmount: Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  getTokenBAmount = async (tokenAmount: BigNumber) => {
    console.log('getTokenBAmount...');

    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
      if (checkSelectedTokens) {
        const reserveCalc: BigNumber = await this.checkIfpairAddressExists();

        console.log(
          `Exchange address - getTokenBAmount: ${this.state.pairAddress}`
        );
        if (reserveCalc && reserveCalc.gt(0)) {
          if (BigNumber.from(tokenAmount).gt(0)) {
            const res = await this._getTokenAmountOut(tokenAmount);

            if (!res) {
              console.log('Price impact is to high...');
              this.setMsg('Price impact is to high...');
              this.setState({
                priceImpact: '100',
              });
              return;
            }

            return res[1].toString();
          } else {
            console.log('TokenAmount is undefined..');
          }
        } else {
          console.log('No Pair exists.. ');
          this.setMsg('No Pair exists.. ');
          if (this.child?.current) {
            await this.child.current.resetFormFields();
          }
        }
      } else {
        console.log('getTokenBAmount: Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  _getTokenAmountOut = async (_amount: BigNumber) => {
    console.log('_getTokenAmountOut..');
    try {
      const res = await this.state.router.getAmountsOut(_amount, [
        this.state.tokenAData.address,
        this.state.tokenBData.address,
      ]);

      return res;
    } catch (err: any) {
      console.log('---------------');
      console.log(`_getTokenAmountOut ${err}`);
      this.setState({
        priceImpact: '100',
      });
      console.log('---------------');
    }
  };

  _getTokenAmountIn = async (_amount: BigNumber) => {
    console.log('_getTokenAmountIn..');
    try {
      const res = await this.state.router.getAmountsIn(_amount, [
        this.state.tokenAData.address,
        this.state.tokenBData.address,
      ]);

      return res;
    } catch (err: any) {
      console.log('---------------');
      console.log(`_getTokenAmountIn ${err}`);
      this.setState({
        priceImpact: '100',
      });
      console.log('---------------');
    }
  };

  toggleTokenListModal = async (tokenBSelected: boolean) => {
    this.setState({ isOpen: !this.state.isOpen, tokenBSelected });
  };

  toggleSlippageModal = async () => {
    this.setState({ isOpenModalSlippage: !this.state.isOpenModalSlippage });
  };

  toggleNetworkModal = async () => {
    console.log('toggleNetworkModal..');
    this.setState({ isOpenModalNetwork: !this.state.isOpenModalNetwork });
  };

  toggleLiquidityMigrate = async () => {
    console.log('toggleLiquidityMigrate');
    this.setState({
      isOpenLiquidityMigrate: !this.state.isOpenLiquidityMigrate,
    });
  };

  toggleNetworkTransaction = async () => {
    console.log('toggleTransactionModal..');
    this.setState({
      isOpenModalTransaction: !this.state.isOpenModalTransaction,
    });
  };

  disableNetworkModal = async () => {
    console.log('toggleNetworkModal..');
    this.setState({ isOpenModalNetwork: false });
  };

  setMsg = (msgTxt: string) => {
    this.setState({ msg: true, msgTxt });
    setTimeout(() => this.setState({ msg: false }), 10000);
  };

  getTokenAData = async (tokenAData: ITokenData, isModulActive: false) => {
    console.log('getTokenAData selected... ');

    if (isModulActive) {
      this.setState({
        tokenAData,
        isOpen: !this.state.isOpen,
        pairAddress: '',
      });
    } else {
      this.setState({ tokenAData, pairAddress: '' });
    }

    if (this.state.tokenBData) {
      window.history.replaceState(
        null,
        null,
        `/q/path/input_token=${tokenAData.address}=output_token=${this.state.tokenBData.address}`
      );
    }

    if (tokenAData?.address === this.state.tokenBData?.address) {
      window.history.replaceState(
        null,
        null,
        `/q/path/input_token=${tokenAData.address}`
      );
      this.setState({
        tokenBData: null,
        tokenBBalance: '0',
      });
    }
    await this.getTokenAmountAfterSelectedAToken();
    await this.checkIfBlueberryTokenSelected(tokenAData);
    if (this.state.account)
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    if (this.child.current) {
      if (this.state.account) await this.getBalances();
    }
  };

  getTokenBData = async (tokenBData: ITokenData, isModulActive: false) => {
    console.log('getTokenBData selected... ');

    if (isModulActive) {
      this.setState({
        tokenBData,
        isOpen: !this.state.isOpen,
        pairAddress: '',
      });
    } else {
      this.setState({ tokenBData, pairAddress: '' });
    }

    if (this.state.tokenAData) {
      window.history.replaceState(
        null,
        '',
        `/q/path/input_token=${this.state.tokenAData.address}=output_token=${tokenBData.address}`
      );
    }

    if (this.state.account) await this.getBalances();
    if (tokenBData?.address === this.state.tokenAData?.address) {
      window.history.replaceState(
        null,
        null,
        `/q/path/output_token=${tokenBData.address}`
      );
      this.setState({
        tokenAData: null,
        tokenABalance: '0',
      });
    }
    await this.getTokenAmountAfterSelectedBToken();
    await this.checkIfBlueberryTokenSelected(tokenBData);
    if (this.state.account)
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    if (this.child.current) {
      if (this.state.account) await this.getBalances();
    }
  };

  checkIfBlueberryTokenSelected = async (tokenData: ITokenData) => {
    if (
      tokenData.address ===
      this.state.BLOCKCHAIN_NETWORK[this.state.networkName].BLUEBERRY_ADDRESS
    ) {
      this.setMsg('Set your slippage tolerance to 10%+');
    }
  };

  getTokenAmountAfterSelectedAToken = async () => {
    console.log('getTokenAmountAfterSelectedAToken..');
    if (this.child?.current) {
      await this.child.current.handleTokenChanges(false);
    }
  };

  getTokenAmountAfterSelectedBToken = async () => {
    console.log('getTokenAmountAfterSelectedBToken..');
    if (this.child.current) {
      await this.child.current.handleTokenChanges(true);
    }
  };

  numberOfZeros = async (num: any) => {
    let numOfZeroes = 0;
    while (num < 1) {
      numOfZeroes++;
      num *= 10;
    }
    return numOfZeroes - 1;
  };

  countDecimals = (value: any) => {
    if (Math.floor(value) !== value)
      return value.toString().split('.')[1].length || 0;
    return 0;
  };

  switchOverTokenSelection = async (tokenData: ITokenData) => {
    if (tokenData.address !== this.state.tokenAData.address) {
      this.setState({
        switched: !this.state.switched,
      });
    }
  };

  getPriceImpactAToken = async (input: any) => {
    console.log('getPriceImpactAToken..');
    let reserve_a_initial: any;
    let pairInvertedCalcAddress: any;

    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;
    if (input && BigNumber.from(input).gt(0)) {
      const Pair = new ethers.Contract(
        this.state.pairAddress,
        Exchange.abi,
        provider
      );

      let reserves = await Pair.getReserves();

      const pairCalcAddress = await this.computePairAddress(
        this.state.factory.address,
        this.state.tokenAData,
        this.state.tokenBData
      );

      if (this.state.networkName === NETWORKS.BSC_NAME) {
        pairInvertedCalcAddress = await this.computePairAddressNoSort(
          this.state.factory.address,
          this.state.tokenAData,
          this.state.tokenBData
        );
      } else {
        pairInvertedCalcAddress = await this.computePairAddressNoSort(
          this.state.factory.address,
          this.state.tokenBData,
          this.state.tokenAData
        );
      }

      if (
        pairCalcAddress === pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.BSC_NAME
      ) {
        // BSC
        reserve_a_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve0)
        );
      } else if (
        pairCalcAddress !== pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.BSC_NAME
      ) {
        // BSC reverted
        reserve_a_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve1)
        );
      } else if (
        pairCalcAddress === pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.AVAX_NAME
      ) {
        // AVAX
        reserve_a_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve1)
        );
      } else if (
        pairCalcAddress !== pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.AVAX_NAME
      ) {
        // AVAX reverted
        reserve_a_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve0)
        );
      }

      let amount_traded = parseFloat(ethers.utils.formatUnits(input));

      const fee = 0.01;
      const amountInWithFee = amount_traded * (1 - fee);
      const priceImpactCalc =
        amountInWithFee / (reserve_a_initial + amountInWithFee);

      let priceImpact = (
        Number.parseFloat(priceImpactCalc.toString()) * 100
      ).toFixed(18);

      const countZeros = await this.numberOfZeros(priceImpact);

      if (countZeros <= 1) {
        priceImpact = (
          Number.parseFloat(priceImpactCalc.toString()) * 100
        ).toFixed(2);
      }

      if (Number.parseFloat(priceImpact) < 0.01) {
        priceImpact = '0.01';
      }

      this.setState({
        priceImpact,
      });
    } else {
      this.setState({
        priceImpact: '0',
      });
    }
  };

  getPriceImpactBToken = async (input: any) => {
    console.log('getPriceImpactBToken..');
    const provider = this.isObjectEmpty(this.state.signer)
      ? this.defaultProvider
      : this.state.signer;
    if (input && BigNumber.from(input).gt(0)) {
      const Pair = new ethers.Contract(
        this.state.pairAddress,
        Exchange.abi,
        provider
      );

      let reserves = await Pair.getReserves();

      let reserve_b_initial: any;

      const pairCalcAddress = await this.computePairAddress(
        this.state.factory.address,
        this.state.tokenAData,
        this.state.tokenBData
      );

      let pairInvertedCalcAddress: any;

      if (this.state.networkName === NETWORKS.BSC_NAME) {
        pairInvertedCalcAddress = await this.computePairAddressNoSort(
          this.state.factory.address,
          this.state.tokenAData,
          this.state.tokenBData
        );
      } else {
        pairInvertedCalcAddress = await this.computePairAddressNoSort(
          this.state.factory.address,
          this.state.tokenBData,
          this.state.tokenAData
        );
      }

      if (
        pairCalcAddress === pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.BSC_NAME
      ) {
        // BSC
        reserve_b_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve0)
        );
      } else if (
        pairCalcAddress !== pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.BSC_NAME
      ) {
        // BSC reverted
        reserve_b_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve1)
        );
      } else if (
        pairCalcAddress === pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.AVAX_NAME
      ) {
        //AVAX
        reserve_b_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve1)
        );
      } else if (
        pairCalcAddress !== pairInvertedCalcAddress &&
        this.state.networkName === NETWORKS.AVAX_NAME
      ) {
        // AVAX reverted
        reserve_b_initial = parseFloat(
          ethers.utils.formatUnits(reserves._reserve0)
        );
      }

      let amount_traded = parseFloat(ethers.utils.formatUnits(input));

      const fee = 0.01;
      const amountInWithFee = amount_traded * (1 - fee);
      const priceImpactCalc =
        amountInWithFee / (reserve_b_initial + amountInWithFee);

      let priceImpact = (
        Number.parseFloat(priceImpactCalc.toString()) * 100
      ).toFixed(18);

      const countZeros = await this.numberOfZeros(priceImpact);

      if (countZeros <= 1) {
        priceImpact = (
          Number.parseFloat(priceImpactCalc.toString()) * 100
        ).toFixed(2);
      }

      if (Number.parseFloat(priceImpact) < 0.01) {
        priceImpact = '0.01';
      }

      this.setState({
        priceImpact,
      });
    } else {
      this.setState({
        priceImpact: '0',
      });
    }
  };

  getPairBalances = async (
    token1: Contract,
    token2: Contract,
    PairAddress: string
  ) => {
    try {
      const token_A_LP_Balance = await token1.balanceOf(PairAddress);
      const token_B_LP_Balance = await token2.balanceOf(PairAddress);

      return { token_A_LP_Balance, token_B_LP_Balance };
    } catch (e: any) {
      console.log(e);
    }
  };

  getPairBalanceAccount = async (Pair: Contract) => {
    try {
      const liquidity = await Pair.balanceOf(this.state.account);
      const lpPairBalanceAccount = liquidity.toString();
      return { lpPairBalanceAccount, liquidity };
    } catch (e: any) {
      console.log(e);
      await this.resetLiquidityOwner(Pair);
    }
  };

  resetLiquidityOwner = async (Pair) => {
    this.setState({
      liquidity: 0,
      tokenASelectedShare: '0',
      tokenBSelectedShare: '0',
      lpPairBalanceAccount: '0',
      lpShareAccountviaInput: '0',
      lpAccountShare: 0,
      tokenAShare: 0,
      tokenBShare: 0,
      Pair,
    });
  };

  getLiquidityOwner = async (
    token1Data: ITokenData,
    token2Data: ITokenData
  ) => {
    try {
      const provider = this.isObjectEmpty(this.state.signer)
        ? this.defaultProvider
        : this.state.signer;

      const checkSelectedTokens = await this.checkIfBothTokeSelected(false);
      if (checkSelectedTokens) {
        const token1 = new ethers.Contract(
          this.state.tokenAData?.address,
          ERC20.abi,
          provider
        );

        const token2 = new ethers.Contract(
          this.state.tokenBData?.address,
          ERC20.abi,
          provider
        );

        const pairAddress = await this.getCalcExchangeAddress(
          this.state.tokenAData,
          this.state.tokenBData
        );

        const Pair = new ethers.Contract(pairAddress, Exchange.abi, provider);

        if (
          Pair.address !==
          this.state.BLOCKCHAIN_NETWORK[this.state.networkName].ZERO_ADDRESS
        ) {
          const PairAddress = this.isAddress(Pair.address);

          const { token_A_LP_Balance, token_B_LP_Balance } =
            await this.getPairBalances(token1, token2, PairAddress);

          //Pair balance account
          const { lpPairBalanceAccount, liquidity } =
            await this.getPairBalanceAccount(Pair);

          //Token balance
          const tokenA = token_A_LP_Balance;
          //WETH balance
          const tokenB = token_B_LP_Balance;
          const totalSupply = await Pair.totalSupply();
          const lpAccountShare = liquidity / totalSupply;

          const tokenAShare =
            Number.parseFloat(
              this.fromWei(tokenA, this.state.tokenAData.decimals)
            ) * lpAccountShare;
          const tokenBShare =
            Number.parseFloat(
              this.fromWei(tokenB, this.state.tokenBData.decimals)
            ) * lpAccountShare;

          const tokenASelectedShare = token1Data?.symbol;
          const tokenBSelectedShare = token2Data?.symbol;

          this.setState({
            liquidity,
            lpPairBalanceAccount,
            lpAccountShare,
            tokenASelectedShare,
            tokenBSelectedShare,
            tokenAShare,
            tokenBShare,
            Pair,
          });
        } else {
          await this.resetLiquidityOwner(Pair);
        }
      }
    } catch (e) {
      console.log(`Error getting contract ${e}`);
      console.log(e);
    }
  };

  outsideClick = (e: any) => {
    e.stopPropagation();
    if (
      this.refNav?.current &&
      this.refNav.current.state.dropDownMenuSelected
    ) {
      this.refNav.current.openMenu();
    }

    if (
      this.refNav?.current &&
      this.refNav.current.state.dropDownNetworkSelected
    ) {
      this.refNav.current.openDropdown();
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { t, i18n } = this.props;
    let content = (
      <Context.Provider value={this.state}>
        <div style={{ visibility: this.state.msg ? 'visible' : 'hidden' }}>
          <MsgInner className="MsgInner">{this.state.msgTxt}</MsgInner>
        </div>

        <Tabs
          toggleSlippageModal={this.toggleSlippageModal}
          clearStates={this.clearStates}
          t={t}
          networkName={this.state.networkName}
          main={
            <SwapTokens switchForms={this.switchForms} ref={this.child} t={t} />
          }
          liquidity={<AddLiquidity ref={this.child} t={t} />}
        />
      </Context.Provider>
    );
    return (
      <>
        <Context.Provider value={this.state}>
          <Navbar
            ref={this.refNav}
            toggleNetworkModal={this.toggleNetworkModal}
            toggleLiquidityMigrate={this.toggleLiquidityMigrate}
            account={this.state.account}
            isPriceChart={this.state.isPriceChart}
            t={t}
            i18n={i18n}
          />
        </Context.Provider>

        {!this.state.isPriceChart ? (
          <div className="container-fluid" onClick={this.outsideClick}>
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto main"
              style={{ maxWidth: '500px' }}
            >
              {content}
            </main>
          </div>
        ) : (
          <BrowserRouter>
            <Route path="/priceChart">
              <Switch>
                <PriceChartContainer />
              </Switch>
            </Route>
          </BrowserRouter>
        )}

        <Context.Provider value={this.state.slippage}>
          <ModalSlippage
            setSlippage={this.setSlippage}
            isOpen={this.state.isOpenModalSlippage}
            toggleSlippageModal={this.toggleSlippageModal}
          />
        </Context.Provider>

        <Context.Provider value={this.state}>
          <ModalFormTransaction
            isOpen={this.state.isOpenModalTransaction}
            toggleNetworkTransaction={this.toggleNetworkTransaction}
          />
          <ModalLiquidityMigrate
            isOpenLiquidityMigrate={this.state.isOpenLiquidityMigrate}
            toggleLiquidityMigrate={this.toggleLiquidityMigrate}
            toggleTokenListModal={this.toggleTokenListModal}
            openTransactionModal={this.openTransactionModal}
          />
          <Modal
            getTokenAData={this.getTokenAData}
            getTokenBData={this.getTokenBData}
            tokenBSelected={this.state.tokenBSelected}
            isOpen={this.state.isOpen}
            toggleTokenListModal={this.toggleTokenListModal}
            tokensData={this.state.tokensData}
          />
        </Context.Provider>
      </>
    );
  }
}
export default withTranslation('common')(App);
