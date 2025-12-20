# Scripts Directory

This directory contains automation scripts for deployment, scaffolding, and documentation generation.

## Available Scripts

### 1. deploy.js - Contract Deployment Script

Deploys the AnonymousMedicalReview contract to various networks.

**Usage:**
```bash
# Deploy to local network
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy
```

**Features:**
- Deploys contract with proper configuration
- Saves deployment information to deployment-info.json
- Displays deployment details (address, transaction hash, etc.)
- Handles network-specific configurations

**Configuration:**
- Local: Requires running Hardhat node (`npm run node`)
- Sepolia: Requires .env file with PRIVATE_KEY and INFURA_API_KEY

**Example Output:**
```
Deploying AnonymousMedicalReview...
Contract deployed to: 0x1234567890abcdef...
Transaction hash: 0xabcdef1234567890...
Deployer address: 0x9876543210fedcba...
```

### 2. Automation Scripts (../automation/)

While technically in the automation/ directory, these scripts are commonly used:

#### create-fhevm-example.js - Example Scaffolding Tool

Generates standalone FHEVM example repositories from the current project.

**Usage:**
```bash
npm run scaffold <example-name> [category]
```

**Example:**
```bash
npm run scaffold medical-review access-control
```

**What it does:**
1. Creates new directory structure
2. Copies contract files
3. Copies test files
4. Generates customized package.json
5. Creates README and documentation
6. Sets up .gitignore and .env.template
7. Installs dependencies

**Generated Structure:**
```
fhevm-<example-name>-example/
├── contracts/          # Your contract
├── test/              # Your tests
├── scripts/           # Deployment scripts
├── automation/        # Doc generator
├── docs/             # Documentation
├── hardhat.config.js # Configuration
└── package.json      # Dependencies
```

#### generate-docs.js - Documentation Generator

Generates GitBook-compatible documentation from code annotations.

**Usage:**
```bash
npm run generate-docs
```

**What it generates:**
- `docs/SUMMARY.md` - Table of contents
- `docs/quick-start.md` - Quick start guide
- `docs/concepts/` - Concept explanations
- `docs/examples/` - Example walkthroughs
- `docs/api/` - API reference

**Features:**
- Extracts JSDoc/TSDoc from test files
- Generates API docs from contracts
- Creates category-based organization
- Updates GitBook SUMMARY.md

## Creating New Scripts

When adding new automation scripts:

### 1. Choose the Right Location

```
scripts/          # Deployment and project-specific scripts
automation/       # Scaffolding and documentation tools
```

### 2. Follow Naming Convention

```javascript
// Good names
deploy.js
deploy-testnet.js
verify-contract.js

// Bad names
script1.js
temp.js
test.js
```

### 3. Add to package.json

```json
{
  "scripts": {
    "your-script": "node scripts/your-script.js"
  }
}
```

### 4. Include Documentation

Add a header comment:
```javascript
/**
 * @fileoverview Brief description
 *
 * Usage: node scripts/your-script.js [args]
 *
 * Example:
 *   node scripts/your-script.js --network sepolia
 */
```

## Common Script Patterns

### Contract Deployment Template

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying Contract...");

  // Get contract factory
  const Contract = await hre.ethers.getContractFactory("ContractName");

  // Deploy contract
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  // Get address
  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Contract Interaction Template

```javascript
const hre = require("hardhat");

async function main() {
  // Get deployed contract
  const contractAddress = "0x...";
  const Contract = await hre.ethers.getContractFactory("ContractName");
  const contract = Contract.attach(contractAddress);

  // Interact with contract
  const result = await contract.someFunction();
  console.log("Result:", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Environment Configuration

Scripts use environment variables from `.env`:

```bash
# Required for testnet deployment
PRIVATE_KEY=your_private_key_without_0x_prefix
INFURA_API_KEY=your_infura_api_key

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
```

**Security Note:** Never commit .env files to git!

## Testing Scripts

Before committing new scripts:

```bash
# Test locally
node scripts/your-script.js

# Test with Hardhat
npx hardhat run scripts/your-script.js --network localhost

# Test deployment flow
npm run node          # Terminal 1
npm run deploy:local  # Terminal 2
```

## Script Dependencies

Scripts may require these packages:

```json
{
  "dependencies": {
    "ethers": "^6.7.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "hardhat": "^2.22.0",
    "@nomicfoundation/hardhat-toolbox": "^5.0.0"
  }
}
```

## Troubleshooting

### "Cannot find module" Error

```bash
npm install
```

### "Network not configured" Error

Check `hardhat.config.js` has the network defined:
```javascript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### "Insufficient funds" Error

- For testnet: Get ETH from faucet
- For local: Ensure Hardhat node is running

### "Nonce too high" Error

Reset your account:
```bash
npx hardhat clean
# Restart Hardhat node
```

## Resources

- [Hardhat Scripts](https://hardhat.org/hardhat-runner/docs/guides/scripts)
- [Ethers.js Documentation](https://docs.ethers.org)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)

## Contributing

When adding scripts:

1. **Test thoroughly** - Ensure it works in all scenarios
2. **Document clearly** - Add comments and README entry
3. **Handle errors** - Use try-catch and meaningful error messages
4. **Follow conventions** - Match existing code style
5. **Update package.json** - Add npm script if applicable

## Maintenance

Regular tasks:

- Update dependencies when needed
- Test scripts after FHEVM updates
- Keep documentation in sync with code
- Remove deprecated scripts

---

**Last Updated:** December 2025
**Maintained By:** Project Contributors
