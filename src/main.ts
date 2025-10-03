import { createApp } from 'vue'
import { WagmiPlugin } from '@wagmi/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'
import { wagmiAdapter } from './config/wagmiConfig'
const queryClient = new QueryClient()

createApp(App)
  .use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')
