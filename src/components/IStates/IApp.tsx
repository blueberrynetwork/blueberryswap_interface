import { BigNumber, Contract } from 'ethers';
import { IBLOCKCHAIN_NETWORK, IBLOCKCHAIN_NETWORK_PROPERTIES } from '../shared';

export interface ITokenData {
  address: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}

export interface IApp {
  account: string;
  network: any;
  web3: any;
  router: Contract;
  exchange: Contract;
  factory: Contract;
  Pair: Contract;
  tokenABalance: string;
  tokenBBalance: string;
  tokenABalanceInWei: BigNumber;
  tokenBBalanceInWei: BigNumber;
  loading: boolean;
  loadingRemoveLp: boolean;
  provider: any;
  signer: any;
  exchangeAddress: string;
  swapTokens(tokenAAmount: BigNumber, tokenBAmount: BigNumber): void;
  addLiquidity(tokenAmount: BigNumber, tokenBAmount: BigNumber): void;
  removeLiquidity(liquidityAmount: string): void;
  getTokenAAmount(tokenAmount: BigNumber): void;
  getTokenBAmount(tokenAmount: BigNumber): void;
  getLiquidityOwner(token1Data: ITokenData, token2Data: ITokenData): void;
  getPriceImpactAToken(input: BigNumber): void;
  getPriceImpactBToken(input: BigNumber): void;
  fromWei(value: any, decimals: any): any;
  toWei(value: any, decimals: any): any;
  isOpenModalSlippage: boolean;
  isOpenModalNetwork: boolean;
  isOpenModalTransaction: boolean;
  isOpenLiquidityMigrate: boolean;
  isOpen: boolean;
  toggleSlippageModal(): void;
  toggleTokenListModal(tokenBSelected: boolean): void;
  toggleNetworkModal(): void;
  toggleLiquidityMigrate(): void;
  setMsg(value: string): any;
  tokensData: any;
  tokenAData: ITokenData;
  tokenBData: ITokenData;
  tx: any;
  msg: boolean;
  msgTxt: string;
  outputAddress: any;
  liquidity: any;
  lpPairBalanceAccount: string;
  lpShareAccountviaInput: string;
  lpAccountShare: number;
  priceImpact: string;
  tokenAShare: number;
  tokenBShare: number;
  tokenASelectedShare: string;
  tokenBSelectedShare: string;
  tokenBSelected: boolean;
  outputAmount: any;
  outputAmountInWei: any;
  inputAmount: any;
  inputAmountInWei: any;
  slippage: any;
  setSlippage(slippage: string): any;
  clearStates(): void;
  networkName: string;
  correctNetwork: boolean;
  switched: boolean;
  connectToWeb3(): void;
  web3Modal: any;
  isAddress(address: any): any;
  pairAddress: any;
  replaceDigitsWithZeros(inputAmount: any): any;
  whiteListUser: any[];
  disConnect(): void;
  isPriceChart: boolean;
  checkInvestorShare(liquidityProvider: boolean, input?: any): Promise<boolean>;
  calcMaxTransactionVal: any;
  getBalances(): void;
  getInvestorShare(liquidityProvider: boolean): Promise<any>;
  computePairAddress(factory: any, tokenA: ITokenData, tokenB: ITokenData): any;
  computePairAddressNoSort(
    factory: any,
    tokenA: ITokenData,
    tokenB: ITokenData
  ): any;
  BLOCKCHAIN_NETWORK: IBLOCKCHAIN_NETWORK;
  numberOfZeros(num: any): any;
  setNetwork(networkName: string, clearCache: boolean): void;
}
