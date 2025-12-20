# FHEVM Hardhat Base Template

> This directory contains the base Hardhat template structure used for creating new FHEVM examples

## Overview

The `base-template/` directory serves as a reference structure for the FHEVM Hardhat template used in this project. When creating new FHEVM examples using the scaffolding tool (`npm run scaffold`), the structure defined here is used as the foundation.

## Template Structure

```
base-template/
├── contracts/                    # Smart contracts directory
│   └── [YourContract].sol       # FHEVM contract template
│
├── test/                        # Test suites directory
│   └── [YourContract].test.ts  # Test template with annotations
│
├── scripts/                     # Automation scripts
│   └── deploy.ts               # Deployment script template
│
├── hardhat.config.ts           # Hardhat configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies template
├── .gitignore                  # Git ignore patterns
├── .env.example                # Environment variables template
└── README.md                   # Project documentation template
```

## Core Components

### Hardhat Configuration

The base template uses the official Zama FHEVM Hardhat template:

**Key Features**:
- FHEVM Hardhat plugin (`@fhevm/hardhat-plugin`)
- FHEVM Solidity library (`@fhevm/solidity`)
- TypeChain for type-safe contract interactions
- Hardhat network helpers for testing
- Gas reporting and coverage tools

### Dependencies

**Production Dependencies**:
```json
{
  "@fhevm/solidity": "^0.9.1",
  "encrypted-types": "^0.0.4"
}
```

**Development Dependencies**:
- `@fhevm/hardhat-plugin` - FHEVM integration
- `@nomicfoundation/hardhat-*` - Hardhat tooling
- `typechain` - Type-safe contract wrappers
- `ethers` - Ethereum library
- `chai` - Testing framework
- `ts-node` - TypeScript execution

## Using the Base Template

### Method 1: Using the Scaffolding Tool

```bash
# Run the interactive scaffolding tool
npm run scaffold

# Follow the prompts:
? Project name: MyFHEVMProject
? Description: My FHEVM example
? FHEVM concepts: Encryption, Access Control
? Category: Privacy
```

The tool will:
1. ✅ Create project directory
2. ✅ Copy base template structure
3. ✅ Generate contract template
4. ✅ Create test file with annotations
5. ✅ Set up configuration files
6. ✅ Install dependencies
7. ✅ Generate documentation

### Method 2: Manual Cloning

```bash
# Copy the base structure
cp -r base-template/* my-new-project/
cd my-new-project

# Install dependencies
npm install

# Customize contracts and tests
# ... edit contracts/YourContract.sol
# ... edit test/YourContract.test.ts

# Compile and test
npm run compile
npm test
```

## Contract Template Pattern

The base template contract follows this structure:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title YourContractName
/// @notice Brief description
contract YourContract is ZamaEthereumConfig {
    // State variables
    // ...

    // Constructor
    constructor() {
        // Initialization
    }

    // Functions with FHE operations
    // ...
}
```

## Test Template Pattern

Test files use JSDoc annotations for documentation generation:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * @title Test Suite Title
 * @description What this test suite demonstrates
 * @chapter FHEVM concept
 */
describe("ContractName", function () {
    async function deployFixture() {
        // Setup
        const [owner, user1, user2] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("ContractName");
        const contract = await Contract.deploy();
        return { contract, owner, user1, user2 };
    }

    /**
     * @title Individual Test Title
     * @description What this test demonstrates
     * @chapter encryption|access-control|user-decryption|etc.
     */
    it("should do something", async function () {
        const { contract, owner } = await loadFixture(deployFixture);
        // Test implementation
    });
});
```

## Configuration Files

### hardhat.config.ts

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // Network configurations
  }
};

export default config;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true,
    "resolveJsonModule": true
  }
}
```

## Environment Variables

The template includes `.env.example`:

```env
# Deployment account
PRIVATE_KEY=your_private_key_here

# RPC endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Block explorer verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Customization Guide

### Adding FHEVM Operations

1. **Import FHE types**:
```solidity
import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
```

2. **Declare encrypted variables**:
```solidity
euint8 private encryptedValue;
```

3. **Encrypt data**:
```solidity
encryptedValue = FHE.asEuint8(plaintextValue);
```

4. **Grant permissions**:
```solidity
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, userAddress);
```

### Adding Access Control

```solidity
modifier onlyAuthorized() {
    require(authorizedUsers[msg.sender], "Not authorized");
    _;
}

function restrictedFunction() external onlyAuthorized {
    // ...
}
```

## Best Practices

1. ✅ Inherit from `ZamaEthereumConfig`
2. ✅ Validate inputs before encryption
3. ✅ Always call `FHE.allowThis()` for contract access
4. ✅ Grant user permissions with `FHE.allow()`
5. ✅ Use appropriate encrypted types (euint8, euint16, euint32)
6. ✅ Protect view functions with access control
7. ✅ Emit events for audit trails
8. ✅ Write comprehensive tests with annotations
9. ✅ Document all functions and patterns
10. ✅ Follow fail-secure design principles

## Template Maintenance

### Updating the Template

When updating FHEVM dependencies:

1. Update `package.json` dependencies
2. Update import statements if API changed
3. Update configuration files if needed
4. Test thoroughly with `npm test`
5. Update documentation
6. Regenerate examples with new template

### Version Compatibility

This base template is compatible with:
- FHEVM Solidity: `^0.9.1`
- Hardhat: `^2.26.0`
- Node.js: `>=20.0.0`
- TypeScript: `^5.8.3`

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Official FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Project Documentation](../README.md)
- [Developer Guide](../DEVELOPER_GUIDE.md)

## Support

For questions about using the base template:

1. Check the [Developer Guide](../DEVELOPER_GUIDE.md)
2. Review the [Official FHEVM Template](https://github.com/zama-ai/fhevm-hardhat-template)
3. Consult the [FHEVM Documentation](https://docs.zama.ai/fhevm)
4. Ask in the Zama community forum

---

**Note**: This base template structure is based on the official Zama FHEVM Hardhat template and customized for this project's examples.
