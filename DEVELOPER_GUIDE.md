# Developer Guide: Creating FHEVM Examples

This guide explains how to create new FHEVM examples and maintain the project for the Zama Bounty Program.

## Table of Contents

1. [Creating a New Example](#creating-a-new-example)
2. [Project Structure](#project-structure)
3. [Writing Smart Contracts](#writing-smart-contracts)
4. [Writing Tests](#writing-tests)
5. [Documentation](#documentation)
6. [Scaffolding Tool](#scaffolding-tool)
7. [Testing Your Example](#testing-your-example)
8. [Updating Dependencies](#updating-dependencies)
9. [Common Pitfalls](#common-pitfalls)

## Creating a New Example

### Step 1: Design Your Example

Before writing code, decide:
- What FHEVM concept does it demonstrate? (access control, encryption, decryption, operations)
- What's the use case? (auction, voting, rating system, etc.)
- What error cases should be shown?
- Should it have a video demonstration?

### Step 2: Create the Solidity Contract

Create a new file in `contracts/` directory:

```bash
touch contracts/YourExample.sol
```

#### Contract Template

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title YourExample Contract
/// @notice Demonstrates [CONCEPT] using FHEVM
/// @dev Shows both correct usage and common pitfalls
contract YourExample is ZamaEthereumConfig {

    // ============ State Variables ============

    // Example: encrypted value
    euint32 private encryptedData;

    // ============ Functions ============

    /// @notice Function demonstrating [CONCEPT]
    /// @dev Remember to call FHE.allowThis() for stored encrypted values
    function exampleFunction(uint32 plainValue) external {
        euint32 encrypted = FHE.asEuint32(plainValue);
        // Process encrypted value
        encryptedData = encrypted;

        // Grant access permissions
        FHE.allowThis(encryptedData);
        FHE.allow(encryptedData, msg.sender);
    }
}
```

#### Key Requirements

1. **Include detailed comments**: Explain what the contract does and why
2. **Show FHEVM patterns**: Demonstrate correct usage of FHE library
3. **Include error handling**: Show validation and require statements
4. **Mark limitations**: Note simplifications made for clarity

### Step 3: Create the Test File

Create a test file in `test/` directory:

```bash
touch test/YourExample.test.js
```

#### Test Template

```javascript
/**
 * @fileoverview YourExample Test Suite
 * Demonstrates [CONCEPT] patterns in FHEVM
 * @category access-control
 * @category encrypted-computation
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { FhevmInstance } = require("@zama-ai/fhevm-core");

describe("YourExample", function () {
    let contract;
    let owner;
    let user1;
    let fhevm;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Initialize FHEVM instance
        const fhevmInst = await FhevmInstance.getInstance();
        fhevm = fhevmInst;

        // Deploy contract
        const YourExample = await ethers.getContractFactory("YourExample");
        contract = await YourExample.deploy();
        await contract.waitForDeployment();
    });

    describe("Basic Operations", function () {
        /**
         * Test: Successfully process encrypted value
         * Demonstrates: Creating and storing encrypted values
         */
        it("Should process encrypted value correctly", async function () {
            // Arrange
            const plainValue = 42;

            // Act
            const transaction = await contract.exampleFunction(plainValue);
            await transaction.wait();

            // Assert
            expect(transaction).to.emit(contract, "ExampleEvent");
        });

        /**
         * Test: Reject invalid input
         * Demonstrates: Validation and error handling
         */
        it("Should reject invalid input", async function () {
            // Arrange
            const invalidValue = 999;

            // Act & Assert
            await expect(
                contract.exampleFunction(invalidValue)
            ).to.be.revertedWith("Invalid value");
        });
    });

    describe("Access Control", function () {
        /**
         * Test: Verify FHE permissions are properly set
         * Demonstrates: FHE.allowThis() and FHE.allow() patterns
         */
        it("Should grant proper FHE permissions", async function () {
            // Test that accessing without permissions fails
            // Test that accessing with permissions succeeds
        });
    });
});
```

### Step 4: Add Documentation

Create documentation annotations in your test file:

```javascript
/**
 * Test: [Clear test name]
 * Demonstrates: [What FHEVM concept does this show?]
 */
it("should [expected behavior]", async function () {
    // Test implementation
});
```

## Project Structure

```
fhevm-anonymous-medical-review/
├── contracts/
│   └── AnonymousMedicalReview.sol    # Main contract
├── test/
│   └── MedicalReview.test.js         # Test suite
├── scripts/
│   └── deploy.js                     # Deployment script
├── automation/
│   ├── create-fhevm-example.js       # Scaffolding tool
│   └── generate-docs.js              # Documentation generator
├── docs/                             # Generated documentation
│   ├── SUMMARY.md                    # GitBook index
│   ├── quick-start.md                # Quick start guide
│   ├── api/                          # API documentation
│   ├── concepts/                     # Concept guides
│   └── examples/                     # Example documentation
├── hardhat.config.js                 # Hardhat configuration
├── package.json                      # Project dependencies
├── README.md                         # Project overview
└── DEVELOPER_GUIDE.md               # This file
```

## Writing Smart Contracts

### Best Practices

#### 1. Always Grant FHE Permissions

✅ **Correct:**
```solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission
```

❌ **Incorrect:**
```solidity
FHE.allow(encryptedValue, msg.sender); // Missing allowThis!
```

#### 2. Match Encryption Signer

✅ **Correct:**
```typescript
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(alice).operate(enc.handles[0], enc.inputProof);
```

❌ **Incorrect:**
```typescript
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(bob).operate(enc.handles[0], enc.inputProof); // Wrong signer!
```

#### 3. Validate Input

```solidity
modifier onlyValidInput(uint8 value) {
    require(value >= 1 && value <= 5, "Value out of range");
    _;
}

function submitValue(uint8 value) external onlyValidInput(value) {
    // Process value
}
```

#### 4. Use Meaningful Comments

```solidity
// Good: Explains why
euint32 encryptedSum = FHE.add(a, b);
// We add before aggregating to preserve individual privacy

// Bad: Restates obvious code
euint32 encryptedSum = FHE.add(a, b); // Add a and b
```

## Writing Tests

### Test Structure

Every test should follow the AAA pattern:

```javascript
it("should [expected behavior]", async function () {
    // Arrange: Set up test data
    const input = 42;
    const expectedOutput = 84;

    // Act: Perform the action
    const result = await contract.processValue(input);

    // Assert: Verify the result
    expect(result).to.equal(expectedOutput);
});
```

### Test Coverage Requirements

For each major function:
- ✅ Test successful execution
- ✅ Test invalid inputs
- ✅ Test edge cases (min/max values)
- ✅ Test access control (who can call)
- ✅ Test event emission
- ✅ Test state changes

### Using TSDoc for Documentation

```javascript
/**
 * Test: Submit review with valid data
 * Demonstrates: Proper encrypted value handling and permission setup
 */
it("should accept valid review", async function () {
    // Implementation
});
```

## Documentation

### Auto-generated Documentation

Documentation is automatically generated from:
1. Contract comments (Solidity)
2. Test file annotations (JavaScript)
3. README.md content

To regenerate documentation:

```bash
npm run generate-docs
```

This creates:
- `SUMMARY.md` - GitBook table of contents
- `docs/quick-start.md` - Quick start guide
- `docs/concepts/` - Category-specific concept pages
- `docs/examples/` - Example documentation pages
- `docs/api/` - Contract API reference

### Documentation Guidelines

#### In Contracts

```solidity
/// @title Clear contract name
/// @notice What this contract does
/// @dev Implementation notes and warnings
contract MyContract {
    /// @notice What this function does
    /// @param param1 What this parameter is for
    /// @return What the function returns
    function myFunction(uint256 param1) external returns (bool) {
        // Implementation
    }
}
```

#### In Tests

```javascript
/**
 * @fileoverview What this test file covers
 * @category category1
 * @category category2
 */

/**
 * Test: [What is being tested]
 * Demonstrates: [What FHEVM concepts are shown]
 */
it("should [expected behavior]", async function () {
    // Implementation
});
```

## Scaffolding Tool

### Using create-fhevm-example.js

The scaffolding tool creates a standalone repository from the current example:

```bash
npm run scaffold <example-name> <category>
```

Example:
```bash
npm run scaffold medical-review "access-control"
```

This creates a new directory containing:
- Complete Hardhat setup
- Your contract and tests
- Deployment scripts
- Documentation templates
- Ready-to-install dependencies

### What the Tool Does

1. Creates directory structure
2. Copies configuration files
3. Copies contract and test files
4. Generates package.json with dependencies
5. Generates README.md
6. Generates .gitignore and .env.template
7. Installs npm dependencies

## Testing Your Example

### Compile the Contract

```bash
npm run compile
```

Verify no compilation errors occur.

### Run Tests

```bash
npm test
```

All tests must pass.

### Check Test Coverage

```bash
npm run coverage
```

Aim for 100% coverage on contracts.

### Gas Reporting

```bash
npm run test:gas
```

Shows gas costs for each function.

### Local Deployment

```bash
npm run node              # Terminal 1: Start local node
npm run deploy:local      # Terminal 2: Deploy contract
```

## Updating Dependencies

### When @fhevm/solidity Updates

1. Update in `package.json`
2. Run: `npm install`
3. Test existing examples:
   ```bash
   npm run compile
   npm test
   ```
4. If breaking changes:
   - Update contracts to use new API
   - Update tests
   - Regenerate documentation
5. Regenerate scaffolded examples

### Version Management

Always specify exact versions in automation scripts to ensure consistency:

```javascript
const packageJson = {
    devDependencies: {
        '@fhevm/solidity': '^0.9.1',    // Pin major version
        'hardhat': '^2.22.0',
        // ...
    }
};
```

## Common Pitfalls

### 1. Forgetting FHE.allowThis()

❌ Problem: Contract cannot access encrypted values it stores
```solidity
encryptedValue = FHE.asEuint8(42);
// Missing FHE.allowThis(encryptedValue)!
```

✅ Solution:
```solidity
encryptedValue = FHE.asEuint8(42);
FHE.allowThis(encryptedValue);
```

### 2. Mismatched Encryption Signers

❌ Problem: User encrypts with their address, sends as different address
```javascript
const enc = await fhevm.createEncryptedInput(contract, alice.address)
    .add32(123).encrypt();
await contract.connect(bob).process(enc.handles[0], enc.inputProof);
```

✅ Solution: Same signer throughout
```javascript
const enc = await fhevm.createEncryptedInput(contract, alice.address)
    .add32(123).encrypt();
await contract.connect(alice).process(enc.handles[0], enc.inputProof);
```

### 3. View Functions with Encrypted Values

❌ Problem: Trying to return encrypted values from view functions
```solidity
function getSecret() external view returns (euint8) {
    return encryptedSecret; // Not allowed!
}
```

✅ Solution: Use non-view functions or requestDecryption
```solidity
function getSecret() external returns (euint8) {
    FHE.allowThis(encryptedSecret);
    return encryptedSecret;
}
```

### 4. Missing Input Validation

❌ Problem: Accepting invalid user input
```solidity
function rate(uint8 rating) external {
    euint8 enc = FHE.asEuint8(rating); // What if rating > 5?
}
```

✅ Solution: Validate before encryption
```solidity
function rate(uint8 rating) external {
    require(rating >= 1 && rating <= 5, "Rating must be 1-5");
    euint8 enc = FHE.asEuint8(rating);
}
```

### 5. Not Handling Decryption Callbacks

❌ Problem: Forgetting to implement callback for requestDecryption
```solidity
FHE.requestDecryption(ciphertexts, this.processResult.selector);
// Missing processResult function!
```

✅ Solution: Implement the callback function
```solidity
function processResult(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    // Process decrypted values
}
```

## Submission Checklist

Before submitting your example:

- ✅ Contract compiles without errors
- ✅ All tests pass
- ✅ Test coverage >= 80%
- ✅ Documentation is clear and complete
- ✅ README is up-to-date
- ✅ Code follows existing patterns
- ✅ No hardcoded values (use constants)
- ✅ All FHE permissions properly set
- ✅ Input validation implemented
- ✅ Video demonstration recorded

## Additional Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity API Reference](https://docs.zama.ai/fhevm/solidity-api)
- [Zama Bounty Program](https://github.com/zama-ai/bounty-program)
- [Community Forum](https://www.zama.ai/community)
- [Discord Support](https://discord.gg/zama)

## Questions?

Reach out to the Zama community:
- Discord: https://discord.gg/zama
- Forum: https://www.zama.ai/community
- GitHub Issues: Open an issue in the project repository
