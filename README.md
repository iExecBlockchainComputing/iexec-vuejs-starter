# 🚀 iExec Vue.js Starter - Decentralized Data Protection

A minimal starter to quickly get started with iExec DataProtector and Vue.js.

---

## 📋 About

This project is a simple starter that allows you to:

- Connect a Web3 wallet
- Protect data with iExec DataProtector
- Grant access to protected data
- Discover basic iExec features

**Included features:**
- ✅ Wallet connection with Reown AppKit (WalletConnect)
- ✅ Data protection with iExec DataProtector
- ✅ Grant access functionality for protected data
- ✅ Multi-chain support (Arbitrum One, Arbitrum Sepolia)
- ✅ Simple and clean user interface
- ✅ Built with Vue.js 3, TypeScript, Vite, and Tailwind CSS

---

## 🛠️ Quick Start

1. **Clone the project:**
```bash
git clone https://github.com/iExecBlockchainComputing/iexec-vuejs-starter.git
cd iexec-vuejs-starter
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create your Reown project:**
   - Go to [https://cloud.reown.com/app](https://cloud.reown.com/app)
   - Create a project and choose **AppKit** → **Vue.js**

4. **Configure environment variables:**
```bash
# Create a .env file
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

5. **Start the project:**
```bash
npm run dev
```

Your app will be available at [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
src/
├── App.vue               # Main component with iExec logic
├── main.ts              # Vue app entry point
├── style.css            # Global styles with Tailwind
├── components/
│   └── WelcomeBlock.vue # Welcome component
└── config/
    ├── wagmiConfig.ts   # Wagmi/Reown configuration
    └── wagmiNetworks.ts # Supported blockchain networks
```

---

## 🔍 How It Works

### Data Protection
1. **Connection:** Use Reown AppKit to connect your wallet
2. **Protection:** Enter data name and content to protect
3. **iExec:** Data is encrypted and stored via DataProtector
4. **Result:** You receive the address and metadata of protected data

### Grant Access
1. **Select Network:** Choose the appropriate blockchain network
2. **Configure Access:** Set protected data address, authorized user, and app
3. **Authorization:** Grant specific permissions for data access
4. **Result:** Receive confirmation of granted access with details

---

## 🌐 Supported Networks

- **Arbitrum One** - Chain ID: 42161
- **Arbitrum Sepolia** - Chain ID: 421614

---

## 🚀 Next Steps

This starter is intentionally minimal. You can extend it with:

- More iExec features (compute, marketplace, Web3Mail)
- Advanced data management interface
- Protected dataset marketplace
- Integration with other iExec services
- Custom iExec applications
- Data monetization features

---

## 📚 Resources

- [iExec Documentation](https://docs.iex.ec/)
- [iExec DataProtector API](https://docs.iex.ec/references/dataProtector)
- [Reown AppKit Documentation](https://docs.reown.com/appkit/vue/core/installation)
- [Vue.js Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Happy coding with iExec! 🔒✨**
