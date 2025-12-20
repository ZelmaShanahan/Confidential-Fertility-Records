# Quick Start Guide

> Get started with the Confidential Fertility Records FHEVM example in 5 minutes

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 7.0.0
- **Git**

Check your versions:
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 7.0.0
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ConfidentialFertilityRecords
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Hardhat and related tooling
- FHEVM Solidity library (@fhevm/solidity)
- TypeChain for type-safe contracts
- Testing frameworks (Chai, Mocha)

**Expected time**: 2-3 minutes

## Quick Test Run

### 3. Compile the Contract

```bash
npm run compile
```

**Expected output**:
```
Compiling 1 file with 0.8.24
Compilation finished successfully
```

### 4. Run Tests

```bash
npm test
```

**Expected output**:
```
  PrivateFertilityRecords
    Deployment
      ✓ Should set the correct owner
      ✓ Should initialize with zero records
    Healthcare Provider Authorization
      ✓ Should allow owner to authorize healthcare providers
      ✓ Should prevent unauthorized accounts from authorizing doctors
      ...

  40 passing (2s)
```

**✅ If you see 40 passing tests, everything works!**

## Explore the Example

### View the Smart Contract

```bash
# Open the main contract
cat contracts/ConfidentialFertilityRecords.sol
```

**Key features demonstrated**:
- Multiple encrypted data types (euint8, euint16, euint32, ebool)
- Multi-tier access control (system + patient)
- Emergency access patterns
- FHE permission management

### View the Test Suite

```bash
# Open the comprehensive test file
cat test/PrivateFertilityRecords.test.ts
```

**40+ tests covering**:
- Record creation with encryption
- Access control enforcement
- Emergency access
- Data updates
- Multi-patient isolation

## Create Your Own Example

### 5. Use the Scaffolding Tool

```bash
npm run scaffold
```

**Follow the prompts**:
```
? Project name: MyPrivacyExample
? Description: My FHEVM privacy example
? FHEVM concepts: Encryption, Access Control
? Category: Privacy
```

The tool will:
- ✅ Create project structure
- ✅ Generate contract template
- ✅ Create test file
- ✅ Set up configuration

### 6. Navigate to Your Project

```bash
cd MyPrivacyExample
npm install
npm run compile
npm test
```

## Generate Documentation

### 7. Auto-Generate Docs

```bash
npm run docs:generate
```

**Output**:
```
✓ Parsing test annotations...
✓ Generating documentation files...
✓ Creating SUMMARY.md...
✅ Documentation generated in docs/
```

**View documentation**:
```bash
ls docs/
# README.md
# SUMMARY.md
# encryption.md
# access-control.md
# user-decryption.md
# ...
```

## Deploy Locally

### 8. Start Local Hardhat Node

**Terminal 1**:
```bash
npm run node
```

Keep this running.

### 9. Deploy Contract

**Terminal 2**:
```bash
npm run deploy
```

**Expected output**:
```
Deploying ConfidentialFertilityRecords...
✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Next Steps

### Learn More

- 📖 [Read Full Documentation](README.md) - Complete project overview
- 🏗️ [Architecture Guide](ARCHITECTURE.md) - System design details
- 🧪 [Test Suite Guide](docs/testing.md) - Testing strategies
- ⚙️ [Setup Guide](SETUP.md) - Detailed configuration

### Try Examples

- 🔐 [Encryption Example](docs/encryption.md) - Learn FHE types
- 🛡️ [Access Control](docs/access-control.md) - Authorization patterns
- 📊 [Gas Optimization](docs/gas-optimization.md) - Save gas costs

### Deploy to Testnet

1. **Get testnet ETH** from [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your private key
   ```
3. **Deploy**:
   ```bash
   npm run deploy:sepolia
   ```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run with coverage report |
| `npm run deploy` | Deploy locally |
| `npm run deploy:sepolia` | Deploy to Sepolia |
| `npm run docs:generate` | Generate documentation |
| `npm run scaffold` | Create new example |
| `npm run node` | Start local node |

## Troubleshooting

### Issue: "Cannot find module"

**Solution**:
```bash
npm install
```

### Issue: Tests fail with "FHE not defined"

**Solution**: Make sure contract inherits from `ZamaEthereumConfig`:
```solidity
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    // ...
}
```

### Issue: "Gas estimation failed"

**Solution**: FHE operations are expensive. Set explicit gas limit:
```typescript
await contract.createRecord(..., { gasLimit: 5000000 });
```

### Issue: Compilation errors

**Solution**: Clean and rebuild:
```bash
npm run clean
npm run compile
```

## Getting Help

- 📚 [Developer Guide](DEVELOPER_GUIDE.md) - Detailed development guide
- 🐛 [Contributing Guide](CONTRIBUTING.md) - How to report issues
- 💬 [Zama Discord](https://discord.com/invite/zama) - Community support
- 📖 [FHEVM Docs](https://docs.zama.ai/fhevm) - Official documentation

## What's Next?

Now that you have the basics working:

1. **Explore the contract** - Read `contracts/ConfidentialFertilityRecords.sol`
2. **Study the tests** - Understand patterns in `test/PrivateFertilityRecords.test.ts`
3. **Read documentation** - Check out `docs/` for detailed guides
4. **Build your own** - Use `npm run scaffold` to create new examples
5. **Deploy and test** - Try deploying to testnets

## Time Investment

- ⏱️ **Setup**: 5 minutes
- ⏱️ **First test run**: 2 minutes
- ⏱️ **Explore code**: 15-30 minutes
- ⏱️ **Create own example**: 30-60 minutes
- ⏱️ **Deploy to testnet**: 10 minutes

**Total**: ~1-2 hours to full proficiency

---

## Quick Reference Card

```bash
# Install
npm install

# Test
npm run compile && npm test

# Create new
npm run scaffold

# Generate docs
npm run docs:generate

# Deploy local
npm run deploy

# Deploy testnet
npm run deploy:sepolia
```

---

**Ready to build privacy-preserving applications with FHEVM!** 🚀

Need help? Check the [Developer Guide](DEVELOPER_GUIDE.md) or ask in [Zama Discord](https://discord.com/invite/zama).
