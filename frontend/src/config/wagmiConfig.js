import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botTestnet } from './botChain';

// Reown AppKit Project ID (configurable via env VITE_PROJECT_ID or fallback)
export const projectId = import.meta.env.VITE_PROJECT_ID || 'c4d7d8e20f12c8b0e7d58a1276a4a4b1';

export const networks = [botTestnet];

// Set up Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Initialize AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'AssetHandover',
    description: 'Physical Asset Custody Management Protocol on BOT Chain',
    url: window.location.origin,
    icons: ['https://scan.bohr.life/favicon.ico'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#22c55e',
    '--w3m-color-mix': '#0f172a',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '12px',
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
});

