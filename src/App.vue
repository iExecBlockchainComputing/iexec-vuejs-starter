<script setup lang="ts">
import { ref, watch } from "vue";
import WelcomeBlock from "./components/WelcomeBlock.vue";
import { ProtectedData, IExecDataProtectorCore, IExecDataProtector } from "@iexec/dataprotector";
import { useAccount, useDisconnect } from "@wagmi/vue";
import { useAppKit } from "@reown/appkit/vue";

const { open } = useAppKit();
const { disconnectAsync } = useDisconnect();
const { isConnected, connector } = useAccount();

const dataProtectorCore = ref<IExecDataProtectorCore | null>(null);
const dataToProtect = ref({
  name: "",
  data: "",
});
const protectedData = ref<ProtectedData>();
const isLoading = ref(false);

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

// Watcher Vue équivalent à useEffect
watch(
  [isConnected, connector],
  async ([connected, conn]: [boolean, any]) => {
    if (connected && conn) {
      try {
        const provider = await conn.getProvider();
        const dataProtector = new IExecDataProtector(provider);
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
      <button v-if="!isConnected" @click="login" class="primary">
        Connect my wallet
      </button>
      <button v-else @click="logout" class="secondary">Disconnect</button>
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
          class="bg-green-100 border border-green-300 rounded-xl p-6 mt-6"
        >
          <h3 class="text-green-800 mb-4 text-lg font-semibold">
            ✅ Data protected successfully!
          </h3>
          <div class="text-green-800 space-y-2">
            <p><strong>Name:</strong> {{ protectedData.name }}</p>
            <p><strong>Address:</strong> {{ protectedData.address }}</p>
            <p><strong>Owner:</strong> {{ protectedData.owner }}</p>
            <p><strong>Multiaddr:</strong> {{ protectedData.multiaddr }}</p>
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
