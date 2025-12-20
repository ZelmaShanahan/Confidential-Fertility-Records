# Base Template Guide

This document explains the base Hardhat template used for scaffolding new FHEVM examples.

## Overview

The base template (`fhevm-hardhat-template`) is a minimal, well-configured Hardhat project that serves as the foundation for all generated FHEVM examples. When you run the scaffolding tool, it clones and customizes this template with your specific contract and tests.

## Template Structure

```
fhevm-hardhat-template/
├── contracts/
│   └── [Your contract].sol        # Solidity contract
├── test/
│   └── [Your test].test.js        # Test suite
├── scripts/
│   └── deploy.js                  # Deployment script
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Dependencies
├── .env.template                  # Environment template
├── .prettierrc                     # Code formatter config
├── .solhintrc.json               # Solidity linter config
└── tsconfig.json                 # TypeScript configuration
```

## Key Files Explained

### hardhat.config.js

Configures Hardhat for FHEVM development:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@fhevm/hardhat-plugin");

module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        sepolia: {
            url: process.env.INFURA_API_KEY
                ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
                : "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    },
    gasReporter: {
        enabled: true,
        currency: "USD"
    }
};
```

**Key Configurations:**
- **Solidity Version**: 0.8.24 (ensures FHEVM compatibility)
- **Optimizer**: Enabled to reduce gas costs
- **Networks**: Localhost for testing, Sepolia for testnet
- **Gas Reporter**: Tracks gas usage in tests

### package.json

Defines project metadata and scripts:

```json
{
    "name": "fhevm-[example-name]-example",
    "version": "1.0.0",
    "description": "FHEVM Example demonstrating [concept]",
    "scripts": {
        "compile": "hardhat compile",
        "test": "hardhat test",
        "test:verbose": "hardhat test --verbose",
        "test:gas": "REPORT_GAS=true hardhat test",
        "deploy": "hardhat run scripts/deploy.js --network sepolia",
        "deploy:local": "hardhat run scripts/deploy.js --network localhost",
        "node": "hardhat node",
        "generate-docs": "node automation/generate-docs.js"
    },
    "dependencies": {
        "@fhevm/solidity": "^0.9.1",
        "ethers": "^6.7.1",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "@nomicfoundation/hardhat-toolbox": "^5.0.0",
        "@fhevm/hardhat-plugin": "^0.3.0",
        "hardhat": "^2.22.0",
        "chai": "^4.3.7"
    }
}
```

**Important Dependencies:**
- `@fhevm/solidity`: Core FHEVM library
- `@fhevm/hardhat-plugin`: Testing utilities
- `hardhat`: Development environment
- `chai`: Test assertions

### scripts/deploy.js

Standard deployment script template:

```javascript
const hre = require("hardhat");

async function main() {
    console.log("Deploying contract...");

    const Contract = await hre.ethers.getContractFactory("YourContract");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

**Modifications Made by Scaffolding Tool:**
- Contract name updated to your contract
- Network configuration applied
- Deployment logging customized

## Development Workflow

### 1. Local Testing

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Run tests
npm test

# Run with gas reporting
npm run test:gas
```

### 2. Testnet Deployment

```bash
# Copy environment template
cp .env.template .env

# Edit .env with your keys
PRIVATE_KEY=your_key_here
INFURA_API_KEY=your_key_here

# Deploy to Sepolia
npm run deploy
```

### 3. Local Deployment

```bash
# Terminal 1: Start node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

## Customization Points

When you scaffold a new example, the template is customized in these areas:

### 1. Contract Files
- Source: `contracts/[YourExample].sol`
- Destination: Generated project's `contracts/`

### 2. Test Files
- Source: `test/[YourExample].test.js`
- Destination: Generated project's `test/`

### 3. Configuration Files
- `hardhat.config.js` - Copied as-is
- `.prettierrc` - Code formatting (unchanged)
- `.solhintrc.json` - Linting rules (unchanged)

### 4. Package Metadata
```json
{
    "name": "fhevm-[example-name]-example",
    "description": "FHEVM Example: [Example Name] - Demonstrates [category] patterns"
}
```

### 5. README Generation
- Title and overview customized
- Concepts section reflects your example
- Instructions remain consistent
- Links point to correct resources

### 6. Scripts
```json
{
    "scripts": {
        "deploy": "hardhat run scripts/deploy.js --network sepolia",
        "deploy:local": "hardhat run scripts/deploy.js --network localhost"
    }
}
```

## Dependencies and Versions

### Critical Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@fhevm/solidity` | ^0.9.1 | FHE contract library |
| `@fhevm/hardhat-plugin` | ^0.3.0 | Testing utilities |
| `hardhat` | ^2.22.0 | Development environment |
| `ethers` | ^6.7.1 | Web3 library |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nomicfoundation/hardhat-toolbox` | ^5.0.0 | Essential plugins |
| `chai` | ^4.3.7 | Test assertions |
| `@types/node` | ^20.0.0 | TypeScript types |

### Update Strategy

When major versions are released:

1. **Update in base template first**
   ```bash
   cd fhevm-hardhat-template
   npm install @fhevm/solidity@latest
   npm test
   ```

2. **Verify compatibility**
   - Does it still compile?
   - Do all tests pass?
   - Any breaking changes?

3. **Update scaffolding tool**
   - Edit `automation/create-fhevm-example.js`
   - Update version pins if needed

4. **Regenerate examples**
   ```bash
   npm run scaffold your-example general
   cd your-example && npm test
   ```

5. **Update documentation**
   - Note breaking changes
   - Update examples if needed
   - Regenerate docs

## Extending the Template

### Adding a New Script

1. Create the script in `scripts/`:
   ```javascript
   // scripts/yourScript.js
   async function main() {
       // Implementation
   }
   main().catch(error => {
       console.error(error);
       process.exit(1);
   });
   ```

2. Add to `package.json`:
   ```json
   {
       "scripts": {
           "your-script": "hardhat run scripts/yourScript.js"
       }
   }
   ```

### Adding a Plugin

1. Install in template:
   ```bash
   npm install --save-dev your-plugin
   ```

2. Load in `hardhat.config.js`:
   ```javascript
   require("your-plugin");
   ```

### Modifying Configuration

Edit `hardhat.config.js` in the template, then all generated examples inherit the changes.

## Network Configuration

### Localhost (Local Testing)

- No setup required
- Run `npm run node` to start
- Default: `http://127.0.0.1:8545`
- Use `npm run deploy:local`

### Sepolia (Ethereum Testnet)

- Requires Infura account (free)
- Get testnet ETH from faucet
- Set environment variables
- Use `npm run deploy`

### Adding a New Network

Edit `hardhat.config.js`:

```javascript
networks: {
    mynetwork: {
        url: process.env.MY_NETWORK_RPC,
        accounts: [process.env.PRIVATE_KEY]
    }
}
```

Then deploy with:
```bash
npm run deploy -- --network mynetwork
```

## Troubleshooting

### Compilation Errors

```bash
npm run compile
```

Check:
- Solidity version matches (0.8.24)
- FHEVM imports are correct
- No syntax errors

### Test Failures

```bash
npm run test:verbose
```

Verify:
- Contract is deployed in beforeEach
- Signers are properly initialized
- Transactions are awaited
- Assertions match actual behavior

### Gas Reporting Issues

```bash
npm run test:gas
```

Ensure:
- `REPORT_GAS=true` is set
- No transactions are failing
- Gas reporter is installed

### Deployment Fails

Check:
- `.env` file has correct values
- Network is accessible
- Account has testnet funds
- Private key format is correct

## Best Practices

1. **Always Test Locally First**
   - Run tests before deploying
   - Use verbose output if issues occur
   - Check gas costs

2. **Never Commit Secrets**
   - Use `.env.template` for examples
   - Add `.env` to `.gitignore`
   - Don't commit private keys

3. **Keep Dependencies Updated**
   - Monitor FHEVM releases
   - Test major upgrades first
   - Document breaking changes

4. **Follow Code Style**
   - Run Prettier: `npx prettier --write .`
   - Run Solhint: `npx solhint contracts/**/*.sol`
   - Consistent formatting improves readability

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [FHEVM Plugin Guide](https://docs.zama.ai/fhevm/hardhat-plugin)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Solidity Documentation](https://docs.soliditylang.org)

## Summary

The base template provides:
- ✅ Complete Hardhat setup for FHEVM
- ✅ Testing infrastructure with FHEVM utilities
- ✅ Deployment scripts for multiple networks
- ✅ Code formatting and linting configuration
- ✅ Environment variable management
- ✅ Gas reporting capabilities
- ✅ Consistent project structure

When customized by the scaffolding tool, it becomes a ready-to-use FHEVM example project.
