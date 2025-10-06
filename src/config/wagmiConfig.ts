import { http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/vue';
import wagmiNetworks from './wagmiNetworks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Get projectId from https://cloud.reown.com
if (!import.meta.env.VITE_REOWN_PROJECT_ID) {
  throw new Error('You need to provide VITE_REOWN_PROJECT_ID env variable');
}

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID!;

const networks = Object.values(wagmiNetworks) as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  networks: networks,
  transports: Object.fromEntries(
    Object.values(wagmiNetworks).map((network) => [network.id, http()])
  ),
  projectId,
});

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks,
  projectId,
  features: {
    email: false,
    socials: false,
  },
  allWallets: 'HIDE',
  allowUnsupportedChain: false,
  enableWalletGuide: false,
});

