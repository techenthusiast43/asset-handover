# AssetHandover on BOT Chain

**AssetHandover** is a lightweight, enterprise-grade Web3 decentralized application (dApp) for physical asset custody management deployed on **BOT Chain**.

It enables companies, facilities, and individuals to register physical equipment (laptops, vehicles, access keys, industrial machinery, testing instruments) on-chain and execute cryptographic, two-party handovers. A custody transfer only takes effect once the designated recipient wallet explicitly accepts the handover.

---

## 🌐 BOT Chain Network Parameters

| Parameter | Configuration |
| :--- | :--- |
| **Network Name** | BOT Chain Testnet |
| **Chain ID** | `968` (Hex: `0x3c8`) |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` (or `tBOT`) |
| **Decimals** | 18 |
| **Total Supply** | 150 Million BOT |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |

---

## 🔐 Core Protocol Invariants & Rules

1. **Unique Asset Registration:** Every physical asset requires a unique physical reference (serial number, barcode, VIN). Duplicate physical references are rejected by the contract.
2. **Immutable Original Ownership:** The original creator remains permanently recorded on-chain, even after multiple custody handovers.
3. **Exclusive Custodian Initiation:** Only the active `currentCustodian` has permission to initiate a handover to another wallet.
4. **Self-Handover Prevention:** A wallet cannot initiate a handover to itself (`recipient != msg.sender`).
5. **Single Pending Handover Limit:** An asset cannot have multiple simultaneous pending handover requests.
6. **Explicit Recipient Consent:** Only the designated recipient wallet can **Accept** or **Reject** the transfer.
7. **Rejection Safety:** If the recipient rejects custody (e.g., damaged goods, discrepancy), custody stays with the previous custodian and an on-chain rejection event is recorded.
8. **Sender Cancellation Safeguard:** The current custodian can revoke an unacknowledged handover request at any time prior to recipient confirmation.
9. **Full Historical Audit Trail:** Every lifecycle event (`AssetRegistered`, `HandoverInitiated`, `HandoverAccepted`, `HandoverRejected`, `HandoverCancelled`) emits an EVM event and updates an on-chain audit log.

---

## 🛠 Project Structure

```
asset-handover/
├── contracts/
│   ├── contracts/
│   │   └── AssetHandover.sol       # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js              # BOT Chain testnet deployment script
│   ├── test/
│   │   └── AssetHandover.test.js  # Automated unit test suite
│   ├── hardhat.config.js          # Hardhat configuration (Chain ID: 968)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, AssetCard, StatusBadge, Toast
│   │   ├── config/
│   │   │   ├── botChain.js        # BOT Chain Viem/Wagmi chain definition
│   │   │   └── wagmiConfig.js     # Reown AppKit + Wagmi configuration
│   │   ├── context/
│   │   │   ├── Web3Provider.jsx   # Wagmi + TanStack Query Provider
│   │   │   └── AssetHandoverContext.jsx # Contract state & Ethers/Wagmi methods
│   │   ├── contracts/
│   │   │   └── contractConfig.json # Deployed address and full ABI
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RegisterAssetPage.jsx
│   │   │   ├── MyAssetsPage.jsx
│   │   │   ├── CreateHandoverPage.jsx
│   │   │   ├── IncomingHandoversPage.jsx
│   │   │   ├── OutgoingHandoversPage.jsx
│   │   │   ├── AssetDetailsPage.jsx
│   │   │   └── HandoverHistoryPage.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── package.json                   # Root workspace scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Smart Contract Compilation & Testing

From the project root:

```bash
# Compile the Solidity smart contract
npm run compile

# Run the complete test suite (unit tests & edge cases)
npm test
```

### 2. Deploy to BOT Chain Testnet

1. Create a `.env` file in the `contracts/` directory:
```env
BOT_TESTNET_RPC="https://rpc.bohr.life"
PRIVATE_KEY="your_bot_testnet_private_key"
```

2. Run the deployment script:
```bash
npm run deploy:bot
```
The script will deploy `AssetHandover.sol` to BOT Chain testnet and automatically export the contract address and ABI to `frontend/src/contracts/contractConfig.json`.

---

## 💻 Running the Frontend

To launch the interactive Web3 dashboard:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Connecting Your Wallet:
- Click **Connect Wallet** in the top navigation bar.
- If your wallet is on an unsupported network, click **Switch to BOT Chain** to automatically prompt MetaMask to add/switch to **Chain ID 968**.
- You can dynamically inspect or override the target contract address anytime by clicking the **Settings** icon in the navbar.

---

## ⚡ Gas Optimization Architecture

1. **Custom Errors:** Solidity 0.8.20 custom errors (e.g., `error EmptyName()`, `error NotCurrentCustodian()`) instead of long revert strings save gas on both deployment and execution.
2. **Compact Struct Packing:** Timestamp fields use `uint64` (packed with addresses/enums where applicable) preventing unnecessary 32-byte slots.
3. **No Redundant On-Chain Storage:** Heavy images and long manuals are kept off-chain; essential concise metadata (serial ref, category, condition memo) is indexed on-chain.
4. **Events for Off-Chain Indexing:** Rejections, cancellations, and handovers emit structured indexed events for block explorer indexing.
5. **Direct View Aggregators:** Helper view functions (`getAllAssets`, `getAssetsByCustodian`, `getIncomingPendingHandovers`) reduce RPC roundtrips and avoid external indexing requirements.

---

## 📄 License
MIT License. Built for BOT Chain developers and asset managers.

