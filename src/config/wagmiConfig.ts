import { http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bellecour } from './bellecourChainConfig';
import { createAppKit } from '@reown/appkit/vue';

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  networks: [bellecour],
  transports: {
    [bellecour.id]: http(),
  },
  ssr: true,
  projectId,
})

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [bellecour],
  projectId,
  defaultNetwork: bellecour,
  features: {
    email: false,
    socials: false,
  },
  allWallets: 'HIDE',
  allowUnsupportedChain: false,
  enableWalletGuide: false,
});
