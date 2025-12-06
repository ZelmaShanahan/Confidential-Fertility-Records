# Setup Guide

Complete step-by-step guide to get the Private Fertility Records FHEVM example running on your local machine.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Frontend Setup](#frontend-setup)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Required Software

- **Node.js**: Version 18.0.0 or higher
  ```bash
  node --version  # Should be >= v18.0.0
  ```

- **npm**: Version 8.0.0 or higher (comes with Node.js)
  ```bash
  npm --version   # Should be >= 8.0.0
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### Recommended Software

- **Visual Studio Code**: For code editing
- **MetaMask**: Browser extension for Web3 interaction
- **Hardhat Extension**: VS Code extension for Solidity development

### Hardware Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Network**: Stable internet connection for testnet interaction

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ConfidentialFertilityRecords
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Hardhat and plugins
- TypeScript and type definitions
- Testing frameworks (Chai, Mocha)
- FHEVM libraries
- Ethers.js v6

**Expected output:**
```
added 500+ packages in 30s
```

### Step 3: Verify Installation

```bash
npx hardhat --version
```

Should output something like:
```
2.19.0
```

---

## Configuration

### Step 1: Create Environment File

```bash
cp .env.example .env
```

### Step 2: Edit Environment Variables

Open `.env` in your text editor:

```env
# For local development, you can leave PRIVATE_KEY empty
PRIVATE_KEY=

# For Sepolia testnet deployment
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Optional: For gas reporting
COINMARKETCAP_API_KEY=your_api_key
REPORT_GAS=false
```

### Step 3: Get Test ETH (for testnet deployment)

1. **Create a wallet** (if you don't have one):
   ```bash
   npx hardhat wallet
   ```

2. **Get Sepolia ETH** from a faucet:
   - Visit: https://sepoliafaucet.com/
   - Or: https://www.alchemy.com/faucets/ethereum-sepolia
   - Paste your wallet address
   - Request test ETH

3. **Add private key to .env**:
   ```env
   PRIVATE_KEY=0xYourPrivateKeyHere
   ```

   ⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

---

## Local Development

### Step 1: Compile Contracts

```bash
npm run compile
```

**Expected output:**
```
Compiling 1 file with 0.8.24
Compilation finished successfully
```

This generates:
- `/artifacts`: Compiled contract artifacts
- `/typechain-types`: TypeScript bindings

### Step 2: Start Local Hardhat Node

**In Terminal 1:**
```bash
npm run node
```

This starts a local Ethereum node with:
- 10 test accounts (each with 10,000 ETH)
- RPC: http://127.0.0.1:8545
- Chain ID: 31337

**Expected output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

### Step 3: Deploy to Local Network

**In Terminal 2:**
```bash
npm run deploy
```

**Expected output:**
```
🚀 Starting deployment...
📍 Deploying from account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🌐 Network: hardhat (ChainID: 31337)
💰 Account balance: 10000.0 ETH

📋 Deploying ConfidentialFertilityRecords contract...
✅ Contract deployed successfully!
📬 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Save the contract address!** You'll need it for the frontend.

---

## Testing

### Run All Tests

```bash
npm test
```

**Expected output:**
```
  PrivateFertilityRecords
    Deployment
      ✓ Should set the correct owner (50ms)
      ✓ Should initialize with zero records

    Healthcare Provider Authorization
      ✓ Should allow owner to authorize healthcare providers (100ms)
      ✓ Should prevent unauthorized doctor from being marked as authorized
      ...

  40 passing (5s)
```

### Run Specific Test

```bash
npx hardhat test --grep "Should create an encrypted medical record"
```

### Run with Gas Reporting

```bash
REPORT_GAS=true npm test
```

**Output includes gas costs:**
```
·-----------------------------------------|---------------------------|-------------|
|    Solc version: 0.8.24                 ·  Optimizer enabled: true  ·  Runs: 200  │
··········································|···························|·············|
|  Methods                                                                          │
·············|····························|·············|·············|·············|
|  Contract  ·  Method                    ·  Min        ·  Max        ·  Avg        │
·············|····························|·············|·············|·············|
|  Fertility ·  createRecord              ·    250000   ·    350000   ·    300000   │
·············|····························|·············|·············|·············|
```

### Run Coverage

```bash
npm run test:coverage
```

Generates a coverage report in `/coverage`.

---

## Deployment

### Deploy to Sepolia Testnet

1. **Ensure configuration is set** (see [Configuration](#configuration))

2. **Check your balance:**
   ```bash
   npx hardhat balance --network sepolia
   ```

3. **Deploy:**
   ```bash
   npm run deploy:sepolia
   ```

4. **Verify deployment** on Etherscan:
   - Visit: https://sepolia.etherscan.io
   - Search for your contract address
   - You should see the contract creation transaction

### Deploy to Zama Devnet

1. **Get Zama testnet tokens** from their faucet

2. **Update hardhat.config.ts:**
   ```typescript
   zamaDevnet: {
     url: "https://devnet.zama.ai",
     accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
     chainId: 8009,
   }
   ```

3. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.ts --network zamaDevnet
   ```

---

## Frontend Setup

### Step 1: Update Contract Address

Edit `public/index.html` and update the contract address:

```javascript
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

Use the address from your deployment output.

### Step 2: Install MetaMask

1. Install MetaMask browser extension
2. Create or import a wallet
3. Switch to Sepolia network

### Step 3: Add Sepolia Network to MetaMask

If Sepolia isn't in your MetaMask:

1. Click MetaMask → Settings → Networks → Add Network
2. Fill in:
   - **Network Name**: Sepolia
   - **RPC URL**: https://sepolia.infura.io/v3/YOUR_KEY
   - **Chain ID**: 11155111
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://sepolia.etherscan.io

### Step 4: Serve the Frontend

**Option 1: Simple HTTP Server**
```bash
npx http-server public -p 8080
```

Then visit: http://localhost:8080

**Option 2: Live Server (VS Code)**
- Install "Live Server" extension
- Right-click `public/index.html`
- Select "Open with Live Server"

### Step 5: Connect Wallet

1. Open the frontend
2. MetaMask should prompt to connect
3. Approve the connection
4. You should see "Connected to Sepolia Network"

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" Error

**Problem:**
```
Error: Cannot find module '@nomicfoundation/hardhat-toolbox'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. "Insufficient funds" Error

**Problem:**
```
Error: insufficient funds for gas
```

**Solution:**
- Get more test ETH from a Sepolia faucet
- Check your wallet balance:
  ```bash
  npx hardhat balance --network sepolia
  ```

#### 3. "Network not supported" Error

**Problem:**
MetaMask shows wrong network

**Solution:**
- Switch to Sepolia in MetaMask
- Or connect to local Hardhat network:
  1. MetaMask → Networks → Add Network → Add manually
  2. RPC: http://127.0.0.1:8545
  3. Chain ID: 31337
  4. Currency: ETH

#### 4. Contract Not Verified on Etherscan

**Problem:**
Can't interact with contract on Etherscan

**Solution:**
Verify the contract:
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

#### 5. "Transaction Underpriced" Error

**Problem:**
```
Error: transaction underpriced
```

**Solution:**
- Gas price too low
- Either wait and retry, or increase gas price in hardhat.config.ts:
  ```typescript
  sepolia: {
    // ...
    gasPrice: 20000000000, // 20 gwei
  }
  ```

#### 6. TypeScript Errors

**Problem:**
```
error TS2307: Cannot find module './typechain-types'
```

**Solution:**
Compile the contracts first:
```bash
npm run compile
```

#### 7. FHEVM Library Not Loading

**Problem:**
Frontend shows: "FHE library not loaded"

**Solution:**
- Check internet connection (CDN loaded)
- Clear browser cache
- Check browser console for errors
- Ensure using HTTPS (some browsers block HTTP)

---

## Development Workflow

### Recommended Workflow

1. **Make changes** to contracts
2. **Compile:**
   ```bash
   npm run compile
   ```
3. **Run tests:**
   ```bash
   npm test
   ```
4. **Deploy to local node:**
   ```bash
   npm run deploy
   ```
5. **Test in frontend**
6. **Deploy to testnet** when ready

### Hot Reload Setup

For frontend development with auto-reload:

```bash
# Terminal 1: Run local node
npm run node

# Terminal 2: Watch for contract changes
npx hardhat watch compilation

# Terminal 3: Serve frontend
npx live-server public
```

---

## Next Steps

After successful setup:

1. ✅ **Explore the code**: Read through the smart contract
2. ✅ **Run tests**: Understand the test suite
3. ✅ **Try the frontend**: Create test records
4. ✅ **Read documentation**: Check ARCHITECTURE.md
5. ✅ **Experiment**: Modify and extend functionality

---

## Getting Help

### Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Ethers.js Docs**: https://docs.ethers.org/v6

### Community

- **GitHub Issues**: Report bugs or ask questions
- **Zama Discord**: Join the FHEVM community
- **Stack Overflow**: Tag questions with `hardhat` or `fhevm`

---

**Setup complete!** 🎉

You're now ready to build privacy-preserving applications with FHEVM.
