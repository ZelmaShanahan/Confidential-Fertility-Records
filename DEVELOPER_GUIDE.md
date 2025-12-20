# Developer Guide

> Guide for maintaining and extending the Confidential Fertility Records FHEVM example

## Table of Contents

- [Overview](#overview)
- [Project Architecture](#project-architecture)
- [Adding New Features](#adding-new-features)
- [Updating Dependencies](#updating-dependencies)
- [Testing Strategy](#testing-strategy)
- [Documentation Workflow](#documentation-workflow)
- [Deployment Procedures](#deployment-procedures)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Overview

This guide is designed for developers who want to:
- Maintain and update this FHEVM example
- Extend functionality with new features
- Update dependencies when new FHEVM versions are released
- Understand the project architecture and design decisions

## Project Architecture

### Directory Structure

```
ConfidentialFertilityRecords/
├── contracts/                           # Solidity smart contracts
│   └── ConfidentialFertilityRecords.sol # Main FHEVM contract
│
├── test/                                # Test suites
│   └── PrivateFertilityRecords.test.ts  # Comprehensive tests with annotations
│
├── scripts/                             # Automation and deployment
│   ├── deploy.ts                        # Contract deployment script
│   ├── generate-docs.ts                 # Documentation generator
│   └── create-example.ts                # Project scaffolding tool
│
├── docs/                                # Generated documentation
│   ├── README.md                        # Main documentation
│   ├── SUMMARY.md                       # GitBook sidebar structure
│   └── *.md                            # Concept-specific guides
│
├── public/                              # Frontend interface
│   └── index.html                       # Web UI for contract interaction
│
├── hardhat.config.ts                    # Hardhat configuration
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
│
├── README.md                            # Project overview
├── ARCHITECTURE.md                      # Architecture documentation
├── SETUP.md                             # Setup instructions
├── DEVELOPER_GUIDE.md                   # This file
├── CONTRIBUTING.md                      # Contribution guidelines
└── BOUNTY_SUBMISSION.md                 # Competition submission details
```

### Key Components

#### Smart Contract (`contracts/ConfidentialFertilityRecords.sol`)

**Purpose**: Core FHEVM contract demonstrating encrypted healthcare records

**Key Features**:
- Multi-level access control (system + patient)
- Encrypted medical data storage
- Emergency access patterns
- Soft delete functionality
- Event-based audit trails

**Design Patterns Used**:
1. **Separation of Concerns**: Encrypted data vs. public metadata in separate structs
2. **Role-Based Access Control**: System authorization + patient permission model
3. **Event Sourcing**: All state changes emit events for audit trails
4. **Fail-Secure**: Default deny, explicit permissions required

#### Test Suite (`test/PrivateFertilityRecords.test.ts`)

**Purpose**: Comprehensive testing with documentation annotations

**Structure**:
- 40+ test cases organized by feature area
- JSDoc/TSDoc annotations for auto-documentation
- Edge cases and anti-patterns
- Gas usage benchmarks

**Annotation Format**:
```typescript
/**
 * @title Test Title
 * @description What this test demonstrates
 * @chapter FHEVM concept (encryption, access-control, etc.)
 * @category Test category
 */
it("should do something", async function () {
    // Test implementation
});
```

#### Automation Scripts

**`scripts/generate-docs.ts`**:
- Parses JSDoc/TSDoc comments from test files
- Generates markdown documentation
- Creates GitBook-compatible SUMMARY.md
- Groups examples by FHEVM concept

**`scripts/create-example.ts`**:
- Interactive CLI for creating new FHEVM examples
- Generates project structure
- Creates contract and test templates
- Sets up documentation

**`scripts/deploy.ts`**:
- Automated contract deployment
- Gas estimation
- Contract verification on Etherscan
- Configuration updates

## Adding New Features

### 1. Adding a New Encrypted Field

**Step 1**: Update the contract struct

```solidity
// contracts/ConfidentialFertilityRecords.sol

struct EncryptedRecord {
    euint8 age;
    euint8 pregnancyCount;
    // ... existing fields ...

    // NEW: Add your encrypted field
    euint16 newEncryptedField;
}
```

**Step 2**: Update the create function

```solidity
function createRecord(
    uint8 _age,
    uint8 _pregnancyCount,
    // ... existing parameters ...
    uint16 _newField  // NEW parameter
) external onlyAuthorizedDoctor {
    // Validate input
    require(_newField <= 1000, "Invalid new field value");

    // Create record with new field
    EncryptedRecord memory record = EncryptedRecord({
        age: FHE.asEuint8(_age),
        pregnancyCount: FHE.asEuint8(_pregnancyCount),
        // ... existing fields ...
        newEncryptedField: FHE.asEuint16(_newField)
    });

    // Grant permissions
    FHE.allowThis(record.newEncryptedField);
    FHE.allow(record.newEncryptedField, msg.sender);

    // ... rest of function ...
}
```

**Step 3**: Update retrieval function

```solidity
function getEncryptedRecord(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)
    returns (
        bytes32 age,
        bytes32 pregnancyCount,
        // ... existing returns ...
        bytes32 newEncryptedField  // NEW return value
    )
{
    EncryptedRecord memory record = medicalRecords[recordId];
    return (
        FHE.toBytes32(record.age),
        FHE.toBytes32(record.pregnancyCount),
        // ... existing fields ...
        FHE.toBytes32(record.newEncryptedField)
    );
}
```

**Step 4**: Add tests

```typescript
// test/PrivateFertilityRecords.test.ts

/**
 * @title Test New Encrypted Field
 * @description Demonstrates encryption and retrieval of the new field
 * @chapter encryption
 */
it("should encrypt and store new field", async function () {
    const { contract, doctor, patient } = await loadFixture(deployFixture);

    // Authorize doctor
    await contract.authorizeDoctor(doctor.address);

    // Create record with new field
    const tx = await contract.connect(doctor).createRecord(
        28,    // age
        2,     // pregnancyCount
        // ... other parameters ...
        500    // newField (NEW)
    );

    await expect(tx).to.emit(contract, "RecordCreated");

    // Verify encrypted
    const record = await contract.getEncryptedRecord(0);
    expect(record.newEncryptedField).to.not.be.undefined;
});
```

**Step 5**: Update documentation

```bash
# Regenerate documentation
npm run docs:generate
```

### 2. Adding a New Access Control Pattern

**Example**: Adding a "read-only" doctor role

**Step 1**: Add state variable

```solidity
// Mapping for read-only access
mapping(address => mapping(address => bool)) public readOnlyDoctorAccess;
```

**Step 2**: Create grant/revoke functions

```solidity
function grantReadOnlyAccess(address doctor) external {
    require(doctor != address(0), "Invalid doctor address");
    require(authorizedDoctors[doctor], "Doctor not system-authorized");

    readOnlyDoctorAccess[msg.sender][doctor] = true;

    emit ReadOnlyAccessGranted(doctor, msg.sender);
}

function revokeReadOnlyAccess(address doctor) external {
    readOnlyDoctorAccess[msg.sender][doctor] = false;

    emit ReadOnlyAccessRevoked(doctor, msg.sender);
}
```

**Step 3**: Create new modifier

```solidity
modifier onlyReadAccess(uint256 recordId) {
    RecordMetadata memory metadata = recordMetadata[recordId];
    require(
        msg.sender == metadata.patient ||
        doctorAccess[metadata.patient][msg.sender] ||
        readOnlyDoctorAccess[metadata.patient][msg.sender],
        "No read access"
    );
    _;
}
```

**Step 4**: Apply to view functions

```solidity
function getEncryptedAge(uint256 recordId)
    external
    view
    onlyReadAccess(recordId)  // Uses new modifier
    returns (bytes32)
{
    return FHE.toBytes32(medicalRecords[recordId].age);
}
```

## Updating Dependencies

### When to Update

- **FHEVM Updates**: New versions of `@fhevm/solidity` or `fhevmjs`
- **Security Patches**: Critical security updates in dependencies
- **Hardhat Updates**: New Hardhat versions with improved features
- **Breaking Changes**: When dependencies have breaking changes

### Update Procedure

**Step 1**: Check current versions

```bash
npm outdated
```

**Step 2**: Review changelogs

Check release notes for:
- Breaking changes
- New features
- Security fixes

**Step 3**: Update package.json

```json
{
  "dependencies": {
    "@fhevm/contracts": "^0.6.0",  // Updated from 0.5.0
    "fhevmjs": "^0.6.0"             // Updated from 0.5.0
  }
}
```

**Step 4**: Install updates

```bash
npm install
```

**Step 5**: Run tests

```bash
npm test
```

**Step 6**: Fix breaking changes

If tests fail, update contract code to match new API:

```solidity
// OLD API (v0.5.0)
import { FHE } from "@fhevm/solidity/lib/FHE.sol";

// NEW API (v0.6.0) - hypothetical example
import { FHEVM } from "@fhevm/solidity/lib/FHEVM.sol";
```

**Step 7**: Update documentation

```bash
npm run docs:generate
```

**Step 8**: Test deployment

```bash
npm run deploy
```

## Testing Strategy

### Test Organization

Tests are organized into categories:

1. **Deployment Tests** - Contract initialization
2. **Authorization Tests** - Doctor authorization
3. **Record Creation Tests** - Creating encrypted records
4. **Access Control Tests** - Permission management
5. **Data Update Tests** - Updating encrypted values
6. **Emergency Access Tests** - Critical care patterns
7. **Record Retrieval Tests** - Data access
8. **Deactivation Tests** - Soft delete
9. **Multi-Patient Tests** - Cross-patient isolation
10. **Gas Optimization Tests** - Performance benchmarks

### Running Tests

```bash
# All tests
npm test

# Specific test suite
npx hardhat test --grep "Access Control"

# With gas reporting
REPORT_GAS=true npm test

# With coverage
npm run test:coverage
```

### Writing New Tests

**Template**:

```typescript
/**
 * @title Test Title
 * @description Clear description of what this test demonstrates
 * @chapter FHEVM concept (encryption, access-control, user-decryption, etc.)
 * @category Test category
 */
it("should demonstrate something", async function () {
    // Setup
    const { contract, doctor, patient } = await loadFixture(deployFixture);

    // Action
    await contract.connect(doctor).someFunction();

    // Assertion
    expect(result).to.equal(expected);
});
```

### Common Test Patterns

**Testing Access Control**:
```typescript
await expect(
    contract.connect(unauthorized).restrictedFunction()
).to.be.revertedWith("Access denied");
```

**Testing Events**:
```typescript
await expect(tx)
    .to.emit(contract, "RecordCreated")
    .withArgs(recordId, patientAddress, doctorAddress);
```

**Testing Encrypted Values**:
```typescript
const encryptedValue = await contract.getEncryptedRecord(recordId);
expect(encryptedValue.age).to.not.be.undefined; // Exists as bytes32
```

## Documentation Workflow

### Auto-Generating Documentation

The project uses JSDoc/TSDoc annotations in test files to generate documentation.

**Step 1**: Annotate tests

```typescript
/**
 * @title Clear Test Title
 * @description Detailed explanation of what this demonstrates
 * @chapter FHEVM concept
 * @category Test category
 *
 * **Example:**
 * ```solidity
 * // Code snippet
 * ```
 *
 * **Why this matters:** Explanation
 */
it("test name", async () => { /* ... */ });
```

**Step 2**: Generate docs

```bash
npm run docs:generate
```

**Step 3**: Review output

Check `docs/` directory for:
- `README.md` - Main documentation
- `SUMMARY.md` - GitBook sidebar
- Concept-specific guides

### Manual Documentation

For architecture, setup, and contributing guides:

1. Edit markdown files directly
2. Follow existing structure and tone
3. Include code examples
4. Add cross-references to related docs

## Deployment Procedures

### Local Deployment (Testing)

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy
npm run deploy
```

### Testnet Deployment (Sepolia)

**Prerequisites**:
- Funded testnet account
- RPC endpoint
- Etherscan API key

**Step 1**: Configure environment

```bash
cp .env.example .env
# Edit .env with your keys
```

**Step 2**: Deploy

```bash
npm run deploy:sepolia
```

**Step 3**: Verify contract

Automatic verification is included in deploy script.

**Step 4**: Update frontend

```javascript
// public/index.html
const CONTRACT_ADDRESS = "0xYourDeployedAddress";
```

### Mainnet Deployment (Production)

**⚠️ Use with caution**

**Pre-deployment checklist**:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Testnet deployment successful
- [ ] Frontend tested end-to-end
- [ ] Documentation updated
- [ ] Emergency procedures documented

**Deploy**:
```bash
npm run deploy:mainnet
```

## Common Tasks

### Adding a New FHEVM Example

Use the scaffolding tool:

```bash
npm run scaffold
```

### Compiling Contracts

```bash
npm run compile
```

### Cleaning Build Artifacts

```bash
npm run clean
```

### Type Generation

```bash
npm run typechain
```

## Troubleshooting

### Issue: Tests Fail with "FHE not defined"

**Solution**: Ensure contract inherits from `ZamaEthereumConfig`

```solidity
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    // ...
}
```

### Issue: "allowThis failed" Error

**Solution**: Always grant contract permission before user permission

```solidity
// ✅ CORRECT order
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);

// ❌ WRONG - missing allowThis
FHE.allow(encryptedValue, msg.sender);
```

### Issue: Gas Estimation Fails

**Solution**: FHE operations are expensive. Ensure sufficient gas limit

```typescript
const tx = await contract.createRecord(..., {
    gasLimit: 5000000  // Explicit gas limit
});
```

### Issue: Deployment Verification Fails

**Solution**: Wait 5 confirmations before verification

```typescript
await tx.wait(5);  // Wait for 5 confirmations
// Then verify
```

## Best Practices

1. ✅ Always validate inputs before encryption
2. ✅ Use appropriate encrypted types (euint8, euint16, euint32)
3. ✅ Grant both contract and user permissions
4. ✅ Write comprehensive tests with annotations
5. ✅ Document all access control changes
6. ✅ Emit events for audit trails
7. ✅ Follow the fail-secure principle
8. ✅ Test on testnet before mainnet
9. ✅ Keep dependencies updated
10. ✅ Regenerate docs after changes

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [Project README](README.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Setup Guide](SETUP.md)

## Support

For questions or issues:

1. Check this guide first
2. Review FHEVM documentation
3. Check existing GitHub issues
4. Ask in the Zama community forum

---

**Last Updated**: December 2025
**FHEVM Version**: 0.5.0
**Hardhat Version**: 2.19.0
