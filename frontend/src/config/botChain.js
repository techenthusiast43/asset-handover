import { defineChain } from 'viem';

export const botTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOT Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

export const BOT_CHAIN_CONFIG = {
  chainId: 968,
  chainIdHex: '0x3c8',
  chainName: 'BOT Chain Testnet',
  rpcUrl: 'https://rpc.bohr.life',
  blockExplorerUrl: 'https://scan.bohr.life',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
};

