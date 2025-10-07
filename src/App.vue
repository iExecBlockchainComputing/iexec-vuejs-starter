<script setup lang="ts">
import { ref, watch } from "vue";
import WelcomeBlock from "./components/WelcomeBlock.vue";
import {
  type ProtectedData,
  type GrantedAccess,
  IExecDataProtectorCore,
  IExecDataProtector,
} from "@iexec/dataprotector";
import { useAccount, useDisconnect, useSwitchChain } from "@wagmi/vue";
import { useAppKit } from "@reown/appkit/vue";
import wagmiNetworks, { explorerSlugs } from "./config/wagmiNetworks";

const { open } = useAppKit();
const { disconnectAsync } = useDisconnect();
const { isConnected, connector, chainId, address } = useAccount();
const { switchChain } = useSwitchChain();

const dataProtectorCore = ref<IExecDataProtectorCore | null>(null);
const dataToProtect = ref({
  name: "",
  data: "",
});
const protectedData = ref<ProtectedData>();
const isLoading = ref(false);

// iExec Web3Mail app addresses by chain
const web3MailAddresses = {
  134: "0x781482c39cce25546583eac4957fb7bf04c277d2", // iExec Sidechain (Bellecour)
  42161: "0xd5054a18565c4a9e5c1aa3ceb53258bd59d4c78c", // Arbitrum One
} as const;

// Grant Access form data
const grantAccessData = ref({
  protectedDataAddress: protectedData.value?.address || "",
  authorizedApp: "",
  authorizedUser: "",
  pricePerAccess: 0,
  numberOfAccess: 1,
});
const grantedAccess = ref<GrantedAccess>();
const isGrantingAccess = ref(false);

const login = () => {
  open({ view: "Connect" });
};

const logout = async () => {
  try {
    await disconnectAsync();
  } catch (err) {
    console.error("Failed to logout:", err);
  }
};

const handleChainChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newChainId = parseInt(target.value);

  if (newChainId && newChainId !== chainId.value) {
    try {
      await switchChain({ chainId: newChainId });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  }
};

const networks = Object.values(wagmiNetworks);

// Get Web3Mail address for current chain
const getCurrentWeb3MailAddress = () => {
  const currentChainId = chainId.value;
  return (
    web3MailAddresses[currentChainId as keyof typeof web3MailAddresses] || ""
  );
};

// Get explorer URL for current chain using iExec explorer
const getExplorerUrl = (
  address: string | undefined,
  type: "address" | "dataset" | "apps" = "address"
) => {
  const currentChainId = chainId.value;
  if (!currentChainId) return null;

  const explorerSlug = explorerSlugs[currentChainId];
  if (!explorerSlug) return null;

  if (!address) return `https://explorer.iex.ec/${explorerSlug}/${type}`;
  return `https://explorer.iex.ec/${explorerSlug}/${type}/${address}`;
};

watch(
  [isConnected, connector],
  async ([connected, conn]: [boolean, any]) => {
    if (connected && conn) {
      try {
        const provider = await conn.getProvider();
        const dataProtector = new IExecDataProtector(provider, {
          allowExperimentalNetworks: true,
        });
        dataProtectorCore.value = dataProtector.core;
      } catch (error) {
        console.error("Failed to initialize data protector:", error);
      }
    }
  },
  { immediate: true }
);

const protectData = async (event: Event) => {
  event.preventDefault();
  if (dataProtectorCore.value) {
    isLoading.value = true;
    try {
      const result = await dataProtectorCore.value.protectData({
        name: dataToProtect.value.name,
        data: {
          email: dataToProtect.value.data,
        },
      });
      console.log("Protected Data:", result);
      protectedData.value = result;
    } catch (error) {
      console.error("Error protecting data:", error);
    } finally {
      isLoading.value = false;
    }
  }
};

const grantDataAccess = async (event: Event) => {
  event.preventDefault();
  if (dataProtectorCore.value) {
    isGrantingAccess.value = true;
    try {
      const result = await dataProtectorCore.value.grantAccess({
        protectedData: grantAccessData.value.protectedDataAddress,
        authorizedApp: grantAccessData.value.authorizedApp,
        authorizedUser: grantAccessData.value.authorizedUser,
        pricePerAccess: grantAccessData.value.pricePerAccess,
        numberOfAccess: grantAccessData.value.numberOfAccess,
        onStatusUpdate: ({ title, isDone }) => {
          console.log(`Grant Access Status: ${title}, Done: ${isDone}`);
        },
      });
      console.log("Granted Access:", result);
      grantedAccess.value = result;
    } catch (error) {
      console.error("Error granting access:", error);
    } finally {
      isGrantingAccess.value = false;
    }
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto p-5">
    <nav
      class="bg-[#F4F7FC] rounded-xl p-4 mb-8 flex justify-between items-center"
    >
      <div class="flex items-center gap-6">
        <div class="font-mono text-xl font-bold text-gray-800">
          iExec Vue.js Starter
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="isConnected" class="flex items-center gap-2">
          <label for="chain-selector" class="text-sm font-medium text-gray-700">
            Chain:
          </label>
          <select
            id="chain-selector"
            :value="chainId"
            @change="handleChainChange"
            class="chain-selector"
          >
            <option
              v-for="network in networks"
              :key="network.id"
              :value="network.id"
            >
              {{ network.name }}
            </option>
          </select>
        </div>
        <button v-if="!isConnected" @click="login" class="primary">
          Connect my wallet
        </button>
        <button v-else @click="logout" class="secondary">Disconnect</button>
      </div>
    </nav>

    <WelcomeBlock />

    <section class="p-8 bg-[#F4F7FC] rounded-xl">
      <div v-if="isConnected">
        <h2 class="mb-6 text-2xl font-semibold text-gray-800">
          Protect my data
        </h2>
        <form @submit="protectData" class="mb-8">
          <div class="mb-5">
            <label for="data_name" class="block mb-2 font-medium text-gray-700">
              Data name to protect
            </label>
            <input
              v-model="dataToProtect.name"
              type="text"
              id="data_name"
              placeholder="Name to identify your data"
              maxlength="100"
            />
          </div>
          <div class="mb-5">
            <label
              for="data_content"
              class="block mb-2 font-medium text-gray-700"
            >
              Data to protect
            </label>
            <input
              v-model="dataToProtect.data"
              type="text"
              id="data_content"
              placeholder="Enter text to protect"
              maxlength="500"
            />
          </div>
          <button
            :disabled="!dataToProtect.name || !dataToProtect.data || isLoading"
            class="primary"
            type="submit"
          >
            {{ isLoading ? "Protecting data..." : "Protect my data" }}
          </button>
        </form>

        <div
          v-if="protectedData"
          class="bg-blue-100 border border-blue-300 rounded-xl p-6 mt-6"
        >
          <h3 class="text-blue-800 mb-4 text-lg font-semibold">
            ✅ Data protected successfully!
          </h3>
          <div class="text-blue-800 space-y-2 text-sm">
            <p><strong>Name:</strong> {{ protectedData.name }}</p>
            <p>
              <strong>Address:</strong> {{ protectedData.address }}
              <a
                v-if="getExplorerUrl(protectedData.address, 'dataset')"
                :href="getExplorerUrl(protectedData.address, 'dataset')!"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                View Dataset
                <svg
                  class="inline-block w-3 h-3 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </p>
            <p>
              <strong>Owner:</strong> {{ protectedData.owner }}
              <a
                v-if="getExplorerUrl(protectedData.owner, 'address')"
                :href="getExplorerUrl(protectedData.owner, 'address')!"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                View Address
                <svg
                  class="inline-block w-3 h-3 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </p>
          </div>
        </div>

        <!-- Grant Access Form -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <h2 class="mb-6 text-2xl font-semibold text-gray-800">
            Grant Access to Protected Data
          </h2>
          <form @submit="grantDataAccess" class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  for="protected_data_address"
                  class="block mb-2 font-medium text-gray-700"
                >
                  Protected Data Address *
                </label>
                <input
                  v-model="grantAccessData.protectedDataAddress"
                  type="text"
                  id="protected_data_address"
                  placeholder="0x123abc..."
                  maxlength="42"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">
                  Address of the protected data you own
                </p>
                <button
                  type="button"
                  @click.prevent="
                    grantAccessData.protectedDataAddress =
                      protectedData?.address || ''
                  "
                  :disabled="!protectedData?.address"
                  class="mt-1 secondary h-9!"
                >
                  Use previously created Protected Data
                </button>
              </div>

              <div>
                <label
                  for="authorized_user"
                  class="block mb-2 font-medium text-gray-700"
                >
                  Authorized User Address *
                </label>
                <input
                  v-model="grantAccessData.authorizedUser"
                  type="text"
                  id="authorized_user"
                  placeholder="0x789cba... or 0x0000... for all users"
                  maxlength="42"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">
                  User who can access the data (use 0x0000... for all users)
                </p>
                <button
                  type="button"
                  @click.prevent="
                    grantAccessData.authorizedUser = address || ''
                  "
                  :disabled="!address"
                  class="mt-1 secondary h-9!"
                >
                  Use current wallet address
                </button>
              </div>

              <div>
                <label
                  for="authorized_app"
                  class="block mb-2 font-medium text-gray-700"
                >
                  Authorized App Address *
                </label>
                <input
                  v-model="grantAccessData.authorizedApp"
                  type="text"
                  id="authorized_app"
                  placeholder="Enter iExec app address (0x...)"
                  maxlength="42"
                  required
                />
                <div class="text-xs text-gray-500 mt-2 space-y-1">
                  <p>application authorized to access your protected data.</p>
                  <p class="text-gray-400 mt-1">
                    App addresses vary by chain. Always verify before granting
                    access.
                  </p>
                  <a
                    v-if="getExplorerUrl('apps')"
                    :href="getExplorerUrl('apps')!"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    See available apps on Explorer
                    <svg
                      class="inline-block w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
                <button
                  v-if="getCurrentWeb3MailAddress()"
                  type="button"
                  @click.prevent="
                    grantAccessData.authorizedApp = getCurrentWeb3MailAddress()
                  "
                  class="mt-2 secondary h-9!"
                >
                  Use Web3Mail Whitelist address for current chain
                </button>
              </div>

              <div>
                <label
                  for="number_of_access"
                  class="block mb-2 font-medium text-gray-700"
                >
                  Number of Access
                </label>
                <input
                  v-model.number="grantAccessData.numberOfAccess"
                  type="number"
                  id="number_of_access"
                  placeholder="1"
                  min="1"
                  max="10000"
                />
                <p class="text-xs text-gray-500 mt-1">
                  How many times the data can be accessed
                </p>
              </div>

              <div class="md:col-span-2">
                <label
                  for="price_per_access"
                  class="block mb-2 font-medium text-gray-700"
                >
                  Price Per Access (nRLC)
                </label>
                <input
                  v-model.number="grantAccessData.pricePerAccess"
                  type="number"
                  id="price_per_access"
                  placeholder="0"
                  min="0"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Fee in nano RLC for each access (1 RLC = 10^9 nRLC)
                </p>
              </div>
            </div>

            <div class="mt-6">
              <button
                :disabled="
                  !grantAccessData.protectedDataAddress ||
                  !grantAccessData.authorizedUser ||
                  !grantAccessData.authorizedApp ||
                  isGrantingAccess
                "
                class="primary"
                type="submit"
              >
                {{ isGrantingAccess ? "Granting Access..." : "Grant Access" }}
              </button>
            </div>
          </form>

          <div
            v-if="grantedAccess"
            class="bg-blue-100 border border-blue-300 rounded-xl p-6 mt-6"
          >
            <h3 class="text-blue-800 mb-4 text-lg font-semibold">
              ✅ Access granted successfully!
            </h3>
            <div class="text-blue-800 space-y-2 text-sm">
              <p>
                <strong>Dataset:</strong> {{ grantedAccess.dataset }}
                <a
                  v-if="getExplorerUrl(grantedAccess.dataset, 'dataset')"
                  :href="getExplorerUrl(grantedAccess.dataset, 'dataset')!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Dataset
                  <svg
                    class="inline-block w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </p>
              <p>
                <strong>Dataset Price:</strong>
                {{ grantedAccess.datasetprice }} nRLC
              </p>
              <p><strong>Volume:</strong> {{ grantedAccess.volume }}</p>
              <p>
                <strong>App Restrict:</strong> {{ grantedAccess.apprestrict }}
              </p>
              <p>
                <strong>Workerpool Restrict:</strong>
                {{ grantedAccess.workerpoolrestrict }}
              </p>
              <p>
                <strong>Requester Restrict:</strong>
                {{ grantedAccess.requesterrestrict }}
                <a
                  v-if="
                    grantedAccess.requesterrestrict !==
                      '0x0000000000000000000000000000000000000000' &&
                    getExplorerUrl(grantedAccess.requesterrestrict, 'address')
                  "
                  :href="
                    getExplorerUrl(grantedAccess.requesterrestrict, 'address')!
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Requester
                  <svg
                    class="inline-block w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 px-6">
        <h2 class="mb-4 text-xl text-gray-600">
          Connect your wallet to get started
        </h2>
        <p class="text-gray-500 mb-6">
          You need to connect your wallet to use data protection features.
        </p>
        <button @click="login" class="primary">Connect my wallet</button>
      </div>
    </section>
  </div>
</template>
