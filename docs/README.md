# Confidential Fertility Records - FHEVM Example

> Privacy-preserving reproductive healthcare data management using Fully Homomorphic Encryption

{% hint style="info" %}
To run this example correctly, make sure the files are placed in the following directories:

- `.sol` file → `<your-project-root-dir>/contracts/`
- `.ts` file → `<your-project-root-dir>/test/`

This ensures Hardhat can compile and test your contracts as expected.
{% endhint %}

## Overview

This comprehensive FHEVM example demonstrates how to build production-ready, privacy-preserving healthcare applications using Fully Homomorphic Encryption. The project showcases real-world application of FHEVM technology for managing sensitive reproductive health records.

## Why This Example Matters

Healthcare data is among the most sensitive personal information. Traditional blockchain solutions struggle with privacy - storing medical data on-chain risks exposure, while off-chain storage sacrifices blockchain benefits. This example showcases how **FHEVM solves this fundamental challenge** by enabling:

- ✅ **On-chain encrypted storage** - Data lives on the blockchain, fully encrypted
- ✅ **Computational privacy** - Smart contracts can operate on encrypted data
- ✅ **Granular access control** - Role-based permissions without exposing data
- ✅ **Regulatory compliance** - Privacy-first design aligns with healthcare regulations (HIPAA, GDPR)

## FHEVM Concepts Demonstrated

This example provides hands-on demonstrations of core FHEVM concepts:

### 1. Encryption (`chapter: encryption`)

**What it demonstrates:**
- Encrypting various data types: `FHE.asEuint8()`, `FHE.asEuint16()`, `FHE.asEuint32()`
- Encrypting boolean values: `FHE.asEbool()`
- Encryption happens at contract level - data never exposed
- Multiple encrypted fields in a single struct

**Example:**
```solidity
// Encrypt sensitive medical data
euint8 encAge = FHE.asEuint8(_age);
euint8 encPregnancyCount = FHE.asEuint8(_pregnancyCount);
euint16 encCycleLength = FHE.asEuint16(_cycleLength);
ebool encIsUnderTreatment = FHE.asEbool(_isUnderTreatment);
```

### 2. Access Control (`chapter: access-control`)

**What it demonstrates:**
- Multi-level authorization (system → patient → doctor)
- Role-based access control (RBAC) for healthcare
- Dynamic permission granting and revocation
- Emergency access with audit trails
- Using `FHE.allowThis()` for contract permissions

**Example:**
```solidity
// Set FHE access permissions
FHE.allowThis(encAge);
FHE.allowThis(encPregnancyCount);

// Modifier enforces access control
modifier onlyPatientOrDoctor(uint256 recordId) {
    require(
        msg.sender == metadata.patient ||
        doctorAccess[metadata.patient][msg.sender],
        "Access denied"
    );
    _;
}
```

### 3. User Decryption (`chapter: user-decryption`)

**What it demonstrates:**
- Retrieving encrypted data as handles using `FHE.toBytes32()`
- View functions with access control
- Client-side decryption patterns
- Returning multiple encrypted values

**Example:**
```solidity
function getEncryptedRecord(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)
    returns (
        bytes32 age,
        bytes32 pregnancyCount,
        bytes32 livebirthCount,
        bytes32 cycleLength,
        bytes32 fertilityScore,
        bytes32 isUnderTreatment
    )
{
    EncryptedRecord memory record = medicalRecords[recordId];
    return (
        FHE.toBytes32(record.age),
        FHE.toBytes32(record.pregnancyCount),
        FHE.toBytes32(record.livebirthCount),
        FHE.toBytes32(record.cycleLength),
        FHE.toBytes32(record.fertilityScore),
        FHE.toBytes32(record.isUnderTreatment)
    );
}
```

### 4. Input Validation (`chapter: input-proof`)

**What it demonstrates:**
- Validating data **before** encryption
- Preventing invalid encrypted states
- Gas optimization through early validation
- Domain-specific validation rules

**Example:**
```solidity
function createRecord(uint8 _age, ...) external {
    // ✅ Validate BEFORE encrypting (saves gas on invalid input)
    require(_age > 0 && _age < 100, "Invalid age");
    require(_fertilityScore <= 100, "Invalid fertility score");

    // Then encrypt
    euint8 encAge = FHE.asEuint8(_age);
    // ...
}
```

### 5. Best Practices (`chapter: best-practices`)

**What it demonstrates:**
- Separation of encrypted data and public metadata
- Event-based audit trails
- Gas-efficient storage layouts
- Soft delete patterns
- Comprehensive error handling

**Design Pattern:**
```solidity
// Encrypted sensitive data
struct EncryptedRecord {
    euint8 age;
    euint8 pregnancyCount;
    // ... other encrypted fields
}

// Public metadata (non-sensitive)
struct RecordMetadata {
    address patient;
    address authorizedDoctor;
    uint256 createdAt;
    string ipfsHash;
}
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ConfidentialFertilityRecords

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
```

## Key Features

### Privacy & Security
- 🔒 End-to-end encrypted medical records using FHEVM
- 🛡️ Multi-tier access control (system, patient, doctor)
- 🚨 Emergency access with full audit logging
- 📝 Immutable audit trail via blockchain events
- 🗑️ Patient-controlled data lifecycle (soft delete)

### Healthcare Functionality
- 👥 Comprehensive fertility data tracking
- 🏥 Multi-provider support
- 📊 Privacy-preserving analytics
- 📎 IPFS integration for additional documents

### Development Excellence
- 🧪 40+ comprehensive tests
- 📚 Auto-generated documentation
- 🚀 Automated scaffolding tools
- ⚙️ Production-ready deployment
- ⛽ Gas optimized

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run test:coverage
```

Expected output:
```
  PrivateFertilityRecords
    Deployment ✓
    Healthcare Provider Authorization ✓
    Record Creation ✓
    Access Control ✓
    Data Updates ✓
    Emergency Access ✓
    Record Retrieval ✓
    ...
  40 passing (2s)
```

## Documentation

For detailed documentation, see:

- [Setup Guide](../SETUP.md) - Installation and configuration
- [Architecture](../ARCHITECTURE.md) - System design and patterns
- [Contributing](../CONTRIBUTING.md) - How to contribute
- [Bounty Submission](../BOUNTY_SUBMISSION.md) - Competition details

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built for the Zama FHEVM Example Hub Bounty (December 2025)**

Privacy-preserving healthcare for everyone.
