//Prod

interface IOVERRIDES {
  gasLimit: number;
}

export interface IBLOCKCHAIN_NETWORK_PROPERTIES {
  ZERO_ADDRESS: string;
  BLUEBERRY_ADDRESS: string;
  WETH_ADDRESS: string;
  FACTORY_ADDRESS: string;
  ROUTER_ADDRESS: string;
  INIT_CODE_HASH: string;
  OVERRIDES: IOVERRIDES;
}

export interface IBLOCKCHAIN_NETWORK {
  AVAX: IBLOCKCHAIN_NETWORK_PROPERTIES;
}

export const BLOCKCHAIN_NETWORK: IBLOCKCHAIN_NETWORK = {
  AVAX: {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    BLUEBERRY_ADDRESS: '0x17d348eAA30F191eE34c3dE874Ba9989f259e44c',
    WETH_ADDRESS: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    FACTORY_ADDRESS: '0x17868C37f0cc4929a99d906C5594F65e886b0972',
    ROUTER_ADDRESS: '0xa9a8A6832Ad3A6f80634837Cd94530fD836A77cd',
    INIT_CODE_HASH:
      '0x373b890db7ab806beea9e7b6710fba00c971d4e38113a8622d39c937a5d674fd',
    OVERRIDES: {
      gasLimit: 8000000,
    },
  },
};
