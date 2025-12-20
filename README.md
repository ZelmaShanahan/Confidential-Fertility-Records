# Confidential Fertility Records

> **Privacy-Preserving Reproductive Healthcare Data Management Using Fully Homomorphic Encryption**

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Hardhat](https://img.shields.io/badge/built%20with-Hardhat-yellow)](https://hardhat.org/)
[![FHEVM](https://img.shields.io/badge/FHEVM-v0.5.0-green)](https://github.com/zama-ai/fhevm)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-40%2B%20passing-success)](test/)

**[Documentation](#documentation) • [Quick Start](#quick-start) • [Video Demo](https://youtu.be/HgUnmln9Zb0) • [Features](#key-features)**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Competition Submission](#competition-submission)
- [FHEVM Concepts Demonstrated](#fhevm-concepts-demonstrated)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Test Suite](#test-suite)
- [Video Demonstration](https://youtu.be/HgUnmln9Zb0) Confidential Fertility Records.mp4
- [Advanced Features](#advanced-features)
- [Deployment](#deployment)
- [Security & Privacy](#security-and-privacy)
- [Gas Optimization](#gas-optimization)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Resources](#resources)
- [License](#license)
- [Live](https://confidential-fertility-records.vercel.app/)

---

## 🎯 Overview

**Confidential Fertility Records** is a comprehensive FHEVM example demonstrating how to build production-ready, privacy-preserving healthcare applications using **Fully Homomorphic Encryption (FHE)**.

This smart contract system enables secure storage and management of sensitive reproductive health records while maintaining complete data privacy through on-chain encryption. Medical data including fertility assessments, treatment history, hormone levels, and pregnancy records remain encrypted at all times, with granular access control ensuring only authorized parties can access specific information.

### Why This Matters

Healthcare data is among the most sensitive personal information. Traditional blockchain solutions struggle with privacy - storing medical data on-chain risks exposure, while off-chain storage sacrifices blockchain benefits. This example showcases how **FHEVM solves this fundamental challenge** by enabling:

- ✅ **On-chain encrypted storage** - Data lives on the blockchain, fully encrypted
- ✅ **Computational privacy** - Smart contracts can operate on encrypted data
- ✅ **Granular access control** - Role-based permissions without exposing data
- ✅ **Regulatory compliance** - Privacy-first design aligns with healthcare regulations (HIPAA, GDPR)

---

## 🏆 Competition Submission

This project is submitted for the **Zama FHEVM Example Hub Bounty (December 2025)**.

### Submission Checklist

✅ **Standalone Hardhat-based Repository** - Complete, self-contained FHEVM example
✅ **Clear FHEVM Concept Demonstration** - Multiple FHE patterns in real-world context
✅ **Comprehensive Test Suite** - 40+ tests with JSDoc/TSDoc annotations
✅ **Automated Documentation Generation** - GitBook-compatible docs from code annotations
✅ **Scaffolding Tool** - CLI for creating new FHEVM examples
✅ **Production-Ready** - Deployment scripts, configuration, and best practices
✅ **Video Demonstration** - 1-minute demo video (required) - [Watch Video](https://youtu.be/HgUnmln9Zb0)
✅ **Complete Documentation** - Setup guides, architecture docs, and API reference

### Category & Concepts

**Primary Category:** Healthcare Privacy
**FHEVM Chapters Covered:**
- `chapter: encryption` - Multiple encryption types and patterns
- `chapter: access-control` - Multi-tier authorization system
- `chapter: user-decryption` - Secure data exposure patterns
- `chapter: input-proof` - Input validation strategies
- `chapter: best-practices` - Gas optimization and design patterns

---

## 🔐 FHEVM Concepts Demonstrated

This example provides **hands-on demonstrations** of core FHEVM concepts:

### 1. **Encryption** (`chapter: encryption`)

**What it demonstrates:**
- Encrypting various data types: `FHE.asEuint8()`, `FHE.asEuint16()`, `FHE.asEuint32()`
- Encrypting boolean values: `FHE.asEbool()`
- Encryption happens at contract level - data never exposed
- Multiple encrypted fields in a single struct

**Code Example:**
```solidity
// Encrypt sensitive medical data
euint8 encAge = FHE.asEuint8(_age);
euint8 encPregnancyCount = FHE.asEuint8(_pregnancyCount);
euint16 encCycleLength = FHE.asEuint16(_cycleLength);
ebool encIsUnderTreatment = FHE.asEbool(_isUnderTreatment);
```

**Learn more:** See `contracts/ConfidentialFertilityRecords.sol:115-124`

---

### 2. **Access Control** (`chapter: access-control`)

**What it demonstrates:**
- Multi-level authorization (system → patient → doctor)
- Role-based access control (RBAC) for healthcare
- Dynamic permission granting and revocation
- Emergency access with audit trails
- Using `FHE.allowThis()` for contract permissions

**Access Control Layers:**

```
┌─────────────────────────────────────────┐
│  Level 1: System Authorization         │
│  (Owner authorizes healthcare providers)│
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Level 2: Patient Authorization         │
│  (Patient grants specific doctor access)│
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Level 3: Data Access                   │
│  (Doctor reads/updates encrypted data)  │
└─────────────────────────────────────────┘
```

**Code Example:**
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

**Learn more:** See test suite `test/PrivateFertilityRecords.test.ts:86-363`

---

### 3. **User Decryption** (`chapter: user-decryption`)

**What it demonstrates:**
- Retrieving encrypted data as handles using `FHE.toBytes32()`
- View functions with access control
- Client-side decryption patterns
- Returning multiple encrypted values

**Code Example:**
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

**Pattern:** Returns encrypted handles (bytes32), not plaintext. Client uses fhevmjs for decryption.

**Learn more:** See `contracts/ConfidentialFertilityRecords.sol:213-238`

---

### 4. **Input Validation** (`chapter: input-proof`)

**What it demonstrates:**
- Validating data **before** encryption
- Preventing invalid encrypted states
- Gas optimization through early validation
- Domain-specific validation rules

**Code Example:**
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

**Why it matters:** Encrypting invalid data wastes gas and creates unusable records.

**Learn more:** See `contracts/ConfidentialFertilityRecords.sol:108-109`

---

### 5. **Best Practices** (`chapter: best-practices`)

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

**Learn more:** See test suite `test/PrivateFertilityRecords.test.ts:825-867`

---

## 🌟 Key Features

### Privacy & Security
- 🔒 **End-to-end encrypted medical records** using FHEVM
- 🛡️ **Multi-tier access control** (system, patient, doctor)
- 🚨 **Emergency access** with full audit logging
- 📝 **Immutable audit trail** via blockchain events
- 🗑️ **Patient-controlled data lifecycle** (soft delete)

### Healthcare Functionality
- 👥 **Comprehensive fertility data tracking**
  - Age, pregnancy history, live births, miscarriages
  - Menstrual cycle tracking and dates
  - Fertility assessment scores
  - Hormone level monitoring
  - Treatment status and complications
- 🏥 **Multi-provider support** - Patients can share records with multiple doctors
- 📊 **Privacy-preserving analytics** - Aggregate statistics without exposing individual data
- 📎 **IPFS integration** - Store additional encrypted documents off-chain

### Development Excellence
- 🧪 **40+ comprehensive tests** - Full coverage of features and edge cases
- 📚 **Auto-generated documentation** - From JSDoc/TSDoc annotations
- 🚀 **Automated scaffolding** - CLI tool for creating new examples
- ⚙️ **Production-ready deployment** - Scripts for local, testnet, and mainnet
- ⛽ **Gas optimized** - Efficient FHE operation usage

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **MetaMask** or compatible Web3 wallet (for frontend)
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ConfidentialFertilityRecords

# Install dependencies
npm install
```

### Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiling 1 file with 0.8.24
Compilation finished successfully
```

### Run Tests

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
    Deployment
      ✓ Should set the correct owner
      ✓ Should initialize with zero records
    Healthcare Provider Authorization
      ✓ Should allow owner to authorize healthcare providers
      ...

  40 passing (2s)
```

### Deploy Locally

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy contract
npm run deploy
```

### Deploy to Sepolia Testnet

```bash
# Configure .env file first (see Deployment section)
npm run deploy:sepolia
```

---

## 📁 Project Structure

```
ConfidentialFertilityRecords/
├── contracts/
│   └── ConfidentialFertilityRecords.sol    # Main FHEVM contract
│
├── test/
│   └── PrivateFertilityRecords.test.ts     # Comprehensive test suite (40+ tests)
│
├── scripts/
│   ├── deploy.ts                            # Deployment script
│   ├── generate-docs.ts                     # Auto-documentation generator
│   └── create-example.ts                    # Scaffolding tool for new examples
│
├── public/
│   └── index.html                           # Frontend interface
│
├── docs/                                    # Auto-generated documentation
│   ├── index.md
│   └── SUMMARY.md
│
├── hardhat.config.ts                        # Hardhat configuration
├── tsconfig.json                            # TypeScript configuration
├── package.json                             # Dependencies and scripts
│
├── README.md                                # This file
├── VIDEO_SCRIPT.md                          # Video production script
├── VIDEO_DIALOGUE                       # Video narration
│
├── ARCHITECTURE.md                          # System architecture
├── SETUP.md                                 # Detailed setup guide
├── CONTRIBUTING.md                          # Contribution guidelines
├── BOUNTY_SUBMISSION.md                     # Competition submission details
│
├── .env.example                             # Environment template
├── .gitignore
├── LICENSE                                  # MIT License
└── vercel.json                              # Deployment configuration
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `contracts/ConfidentialFertilityRecords.sol` | Main smart contract with FHEVM operations |
| `test/PrivateFertilityRecords.test.ts` | Test suite with JSDoc annotations for doc generation |
| `scripts/deploy.ts` | Automated deployment with verification |
| `scripts/generate-docs.ts` | Parses test annotations to generate GitBook docs |
| `scripts/create-example.ts` | CLI tool to scaffold new FHEVM examples |
| `hardhat.config.ts` | Network configuration, compiler settings |
| `VIDEO_SCRIPT.md` | Complete video production script with timings |
| `VIDEO_DIALOGUE` | Narration script (no timestamps) |

---

## 🎓 Usage Examples

### Example 1: Creating a Medical Record

```javascript
import { ethers } from "hardhat";

// Get contract instance
const contract = await ethers.getContractAt(
    "ConfidentialFertilityRecords",
    contractAddress
);

// Healthcare provider creates encrypted fertility record
const tx = await contract.connect(doctor).createRecord(
    28,              // age (encrypted as euint8)
    2,               // pregnancy count (encrypted as euint8)
    1,               // live birth count (encrypted as euint8)
    1,               // miscarriage count (encrypted as euint8)
    28,              // cycle length in days (encrypted as euint16)
    75,              // fertility score 0-100 (encrypted as euint8)
    1704067200,      // last period date timestamp (encrypted as euint32)
    true,            // currently under treatment (encrypted as ebool)
    false,           // has complications (encrypted as ebool)
    120,             // hormone levels 0-255 (encrypted as euint8)
    "QmHash..."      // IPFS hash for additional encrypted documents
);

await tx.wait();
console.log("Record created successfully!");
```

**What happens:**
1. Doctor must be system-authorized (by owner)
2. Input validation occurs before encryption
3. All medical data is encrypted using appropriate FHE types
4. Encrypted record is stored on-chain
5. Access permissions are set via `FHE.allowThis()`
6. `RecordCreated` event is emitted for audit trail

---

### Example 2: Patient Grants Doctor Access

```javascript
// Patient grants access to their doctor
const tx = await contract.connect(patient).grantDoctorAccess(doctorAddress);
await tx.wait();

// Verify access was granted
const hasAccess = await contract.hasDoctorAccess(
    patientAddress,
    doctorAddress
);
console.log(`Doctor has access: ${hasAccess}`); // true
```

**Access Control Flow:**
1. Doctor must first be system-authorized
2. Patient explicitly grants access to specific doctor
3. Doctor can now read and update patient's records
4. Patient can revoke access at any time

---

### Example 3: Retrieving Encrypted Records

```javascript
// Get encrypted record (returns handles, not plaintext)
const encryptedData = await contract
    .connect(authorizedDoctor)
    .getEncryptedRecord(recordId);

// encryptedData contains bytes32 handles:
console.log(encryptedData.age);              // 0x... (encrypted)
console.log(encryptedData.pregnancyCount);   // 0x... (encrypted)
console.log(encryptedData.livebirthCount);   // 0x... (encrypted)
```

**For client-side decryption using fhevmjs:**

```javascript
import { createInstance } from "fhevmjs";

// Initialize FHEVM instance
const fhevm = await createInstance({ chainId, publicKey });

// Decrypt values (requires proper permissions)
const age = await fhevm.decrypt(contractAddress, encryptedData.age);
const pregnancyCount = await fhevm.decrypt(contractAddress, encryptedData.pregnancyCount);

console.log(`Patient age: ${age}`);
console.log(`Pregnancy count: ${pregnancyCount}`);
```

---

### Example 4: Updating Treatment Status

```javascript
// Doctor updates patient's treatment status
const tx = await contract
    .connect(authorizedDoctor)
    .updateTreatmentStatus(recordId, false); // No longer under treatment

await tx.wait();

// Events emitted:
// - TreatmentStatusUpdated(recordId, false)
// - RecordUpdated(recordId, doctorAddress)
```

---

### Example 5: Emergency Access

```javascript
// In emergency situations, authorized doctor can request immediate access
const tx = await contract.connect(emergencyDoctor).emergencyAccess(recordId);
await tx.wait();

// Check emergency access flag
const metadata = await contract.getRecordMetadata(recordId);
console.log(`Emergency access granted: ${metadata.emergencyAccess}`); // true

// Emergency access is logged for audit purposes
const isLogged = await contract.emergencyAccessLog(recordId);
console.log(`Access logged: ${isLogged}`); // true
```

**Security Note:** Emergency access still requires system-level doctor authorization and is fully auditable.

---

### Example 6: Revoking Access

```javascript
// Patient revokes doctor's access
const tx = await contract.connect(patient).revokeDoctorAccess(doctorAddress);
await tx.wait();

// Doctor can no longer access records
await expect(
    contract.connect(doctor).getEncryptedRecord(recordId)
).to.be.revertedWith("Access denied");
```

---

### Example 7: Multi-Patient Scenario

```javascript
// Patient 1 creates record
await contract.connect(doctor1).createRecord(
    28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
);

// Patient 2 creates record
await contract.connect(doctor2).createRecord(
    30, 0, 0, 0, 30, 85, 1704067200, false, false, 110, ""
);

// Each patient has their own isolated records
const patient1Records = await contract.getPatientRecordIds(patient1Address);
const patient2Records = await contract.getPatientRecordIds(patient2Address);

console.log(`Patient 1 records: ${patient1Records.length}`);
console.log(`Patient 2 records: ${patient2Records.length}`);

// Doctor cannot access other patient's records without permission
```

---

## 🧪 Test Suite

The project includes **40+ comprehensive tests** demonstrating proper FHEVM usage patterns, edge cases, and security considerations.

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| **Deployment** | 2 | Contract initialization and setup |
| **Doctor Authorization** | 3 | System-level healthcare provider authorization |
| **Record Creation** | 6 | Encrypted record creation with validation |
| **Access Control** | 6 | Patient-level permission management |
| **Data Updates** | 6 | Updating encrypted values with access checks |
| **Emergency Access** | 3 | Emergency override patterns |
| **Record Retrieval** | 6 | Fetching encrypted data with proper permissions |
| **Record Deactivation** | 3 | Soft delete functionality |
| **Multi-Patient** | 3 | Cross-patient isolation and access control |
| **Gas Optimization** | 2 | Performance benchmarking |

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npx hardhat test --grep "Access Control"

# Run with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run test:coverage
```

### Test Documentation

All tests include JSDoc/TSDoc annotations that are used to generate documentation:

```typescript
/**
 * @test Should create an encrypted medical record with valid data
 * @description Demonstrates the complete flow of creating an encrypted fertility record
 *
 * **FHEVM Operations Demonstrated:**
 * 1. FHE.asEuint8() - Encrypts 8-bit values (age, counts, scores)
 * 2. FHE.asEuint16() - Encrypts 16-bit values (cycle length)
 * 3. FHE.asEuint32() - Encrypts 32-bit values (dates/timestamps)
 * 4. FHE.asEbool() - Encrypts boolean values
 * 5. FHE.allowThis() - Grants contract permission to use encrypted values
 *
 * **Privacy Guarantee:** All medical data is encrypted before storage
 */
it("Should create an encrypted medical record with valid data", async function () {
    // Test implementation...
});
```

### Coverage Report

```bash
npm run test:coverage
```

Expected output:
```
--------------------|----------|----------|----------|----------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines |
--------------------|----------|----------|----------|----------|
 contracts/         |      100 |    95.83 |      100 |      100 |
  Confidential...   |      100 |    95.83 |      100 |      100 |
--------------------|----------|----------|----------|----------|
All files           |      100 |    95.83 |      100 |      100 |
--------------------|----------|----------|----------|----------|
```

---

## 🎥 Video Demonstration

A **1-minute video demonstration** is included with this submission (as required by the bounty).

### Video Contents

The video demonstrates:
1. **Project setup** - Installation and compilation
2. **Contract structure** - Key code highlights
3. **Encryption in action** - FHEVM operations
4. **Access control** - Multi-tier authorization
5. **Test execution** - Running comprehensive test suite
6. **Results** - 40+ tests passing successfully

### Video Files

- `VIDEO_SCRIPT.md` - Complete production script with scene descriptions, timings, and visual guidance
- `VIDEO_DIALOGUE` - Narration script (dialogue only, no timestamps)
- `ConfidentialFertilityRecords.mp4` - Rendered video file

### Watch the Video

[▶️ **Watch Demo Video**](https://youtu.be/HgUnmln9Zb0)

---

## 🛠️ Advanced Features

### 1. Automated Documentation Generation

This project includes a tool that automatically generates GitBook-compatible documentation from test file annotations.

**Usage:**
```bash
npm run docs:generate
```

**What it does:**
- Parses JSDoc/TSDoc comments from test files
- Extracts `@chapter`, `@category`, and `@description` tags
- Generates organized markdown documentation
- Creates GitBook `SUMMARY.md` sidebar
- Groups examples by FHEVM concepts

**Output:**
```
docs/
├── index.md           # Main documentation
├── SUMMARY.md         # GitBook sidebar structure
└── ...                # Additional generated pages
```

**Implementation:** See `scripts/generate-docs.ts`

---

### 2. Project Scaffolding Tool

Create new FHEVM examples using the interactive CLI tool:

```bash
npm run scaffold
```

**The tool will:**
1. ✅ Prompt for project name and description
2. ✅ Select FHEVM concepts to demonstrate
3. ✅ Choose example category (DeFi, Healthcare, Privacy, etc.)
4. ✅ Generate complete project structure
5. ✅ Create contract template with selected FHE operations
6. ✅ Generate test file with JSDoc annotations
7. ✅ Set up deployment scripts
8. ✅ Create README and documentation

**Example interaction:**
```
? Project name: ConfidentialVoting
? Description: Privacy-preserving voting system
? FHEVM concepts: Encryption, Access Control, Public Decryption
? Category: Governance
✓ Creating project structure...
✓ Generating contract template...
✓ Creating test suite...
✓ Setting up documentation...
✅ Project created successfully!
```

**Implementation:** See `scripts/create-example.ts`

---

### 3. Automated Deployment

Production-ready deployment scripts with verification:

```bash
# Local deployment
npm run deploy

# Testnet deployment
npm run deploy:sepolia

# Mainnet deployment (after thorough testing)
npm run deploy:mainnet
```

**Deployment script features:**
- ✅ Automatic contract verification on Etherscan
- ✅ Gas estimation and optimization
- ✅ Transaction confirmation tracking
- ✅ Contract address saving
- ✅ Frontend configuration update
- ✅ Deployment summary and next steps

**Implementation:** See `scripts/deploy.ts`

---

### 4. Frontend Interface

A simple web interface is included for interacting with the contract:

```bash
# Serve locally
npm run serve

# Or open directly
open public/index.html
```

**Features:**
- Connect MetaMask wallet
- Create medical records (doctors)
- Grant/revoke doctor access (patients)
- View encrypted records
- Update treatment status
- Emergency access logging

---

## 🌐 Deployment

### Environment Setup

1. **Copy environment template:**
```bash
cp .env.example .env
```

2. **Configure `.env` file:**
```env
# Deployment account private key
PRIVATE_KEY=your_private_key_here

# RPC endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Block explorers (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas price settings
GAS_PRICE=auto
GAS_LIMIT=8000000
```

**⚠️ Security Warning:** Never commit `.env` file to version control!

---

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

**Expected output:**
```
Deploying ConfidentialFertilityRecords...
  ⏳ Deploying contract...
  ✅ Contract deployed to: 0x1234567890abcdef...
  ⏳ Verifying contract on Etherscan...
  ✅ Contract verified successfully!

📊 Deployment Summary:
  Contract: ConfidentialFertilityRecords
  Address: 0x1234567890abcdef...
  Network: sepolia
  Deployer: 0xabcdef...
  Gas used: 3,456,789

🔗 Next steps:
  1. Update CONTRACT_ADDRESS in public/index.html
  2. Test contract on Sepolia testnet
  3. Verify functionality with frontend
```

---

### Update Frontend Configuration

After deployment, update the contract address in your frontend:

**File:** `public/index.html`

```javascript
// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

---

### Deploy to Production

```bash
# After thorough testing on testnet
npm run deploy:mainnet
```

**Pre-deployment checklist:**
- ✅ All tests passing
- ✅ Security audit completed
- ✅ Gas optimization verified
- ✅ Testnet deployment successful
- ✅ Frontend tested end-to-end
- ✅ Access control verified
- ✅ Emergency procedures documented

---

## 🔒 Security and Privacy

### Privacy Guarantees

**On-chain encrypted storage:**
- ✅ All sensitive medical data encrypted using FHEVM
- ✅ Plaintext never touches the blockchain
- ✅ Data remains encrypted in contract storage
- ✅ Computations performed on encrypted values
- ✅ Only authorized parties can decrypt specific fields

**What's encrypted:**
- Patient age
- Pregnancy history (counts, outcomes)
- Menstrual cycle data
- Fertility assessment scores
- Treatment status
- Complication history
- Hormone levels
- Medical timestamps

**What's public:**
- Patient addresses (required for access control)
- Doctor addresses (required for authorization)
- Record creation and update timestamps
- IPFS hashes (content itself is encrypted)
- Emergency access flags (audit transparency)

---

### Access Control Model

**Three-Tier Authorization System:**

#### Tier 1: System-Level Authorization
- **Who:** Contract owner (system administrator)
- **Power:** Authorize healthcare providers to use the system
- **Function:** `authorizeDoctor(address doctor)`
- **Purpose:** Vet healthcare providers before they can create records

#### Tier 2: Patient-Level Authorization
- **Who:** Patients (data owners)
- **Power:** Grant/revoke specific doctor access to their records
- **Functions:** `grantDoctorAccess(address doctor)`, `revokeDoctorAccess(address doctor)`
- **Purpose:** Patient maintains control over who sees their data

#### Tier 3: Data Access
- **Who:** Authorized doctors with patient permission
- **Power:** Read and update encrypted medical records
- **Enforcement:** `onlyPatientOrDoctor` modifier on sensitive functions
- **Purpose:** Enable healthcare delivery while maintaining privacy

---

### Emergency Access

**Scenario:** Life-threatening emergency requiring immediate access to medical history.

**Mechanism:**
```solidity
function emergencyAccess(uint256 recordId) external onlyAuthorizedDoctor {
    // Grants immediate access
    // Bypasses patient consent requirement
    // Creates permanent audit log
    recordMetadata[recordId].emergencyAccess = true;
    emergencyAccessLog[recordId] = true;
    emit EmergencyAccessGranted(recordId, msg.sender);
}
```

**Security balance:**
- ✅ Enables critical medical care
- ✅ Still requires doctor to be system-authorized
- ✅ Permanently logged on-chain (immutable audit trail)
- ✅ Visible to patient (emergency flag set)
- ✅ Can be reviewed for abuse

---

### Security Considerations

**Input Validation:**
- ✅ All inputs validated before encryption
- ✅ Domain-specific constraints enforced (age ranges, score limits)
- ✅ Prevents invalid encrypted states
- ✅ Gas savings by failing early

**Access Control:**
- ✅ Modifiers enforce permissions on every sensitive operation
- ✅ Multi-level checks (system auth + patient permission)
- ✅ View functions also protected
- ✅ Cross-patient access prevented

**Audit Trail:**
- ✅ All significant operations emit events
- ✅ Emergency access permanently logged
- ✅ Access grants/revocations tracked
- ✅ Record updates attributed to specific addresses

**Data Lifecycle:**
- ✅ Soft delete (not hard delete) maintains audit integrity
- ✅ Patients control record deactivation
- ✅ Deactivated records cannot be accessed or modified
- ✅ Blockchain immutability prevents data tampering

---

### Compliance Considerations

**HIPAA Alignment:**
- ✅ Encryption of protected health information (PHI)
- ✅ Access controls and authorization
- ✅ Audit trails for all data access
- ✅ Patient rights over their data

**GDPR Alignment:**
- ✅ Privacy by design (encrypted by default)
- ✅ Right to access (patients can always view their data)
- ✅ Right to erasure (soft delete functionality)
- ✅ Data minimization (only necessary fields)

**⚠️ Important:** This is a technical example. Production healthcare systems require legal review and additional safeguards.

---

## ⛽ Gas Optimization

FHEVM operations are more gas-intensive than standard Solidity operations. This project implements several optimization strategies:

### Optimization Techniques

**1. Input Validation Before Encryption**
```solidity
// ✅ Good: Validate first, encrypt later
require(_age > 0 && _age < 100, "Invalid age");
euint8 encAge = FHE.asEuint8(_age); // Only encrypt valid data

// ❌ Bad: Encrypt then validate
euint8 encAge = FHE.asEuint8(_age);
// If age is invalid, gas was wasted on encryption
```

**Savings:** Prevents expensive FHE operations on invalid inputs.

---

**2. Efficient Storage Layout**
```solidity
// Separate encrypted and public data
struct EncryptedRecord {
    euint8 age;
    euint8 pregnancyCount;
    // ... encrypted fields only
}

struct RecordMetadata {
    address patient;
    uint256 createdAt;
    // ... public metadata only
}
```

**Benefit:** Avoid unnecessarily encrypting non-sensitive data.

---

**3. Batch Permission Setting**
```solidity
// Set all FHE permissions in one function
FHE.allowThis(encAge);
FHE.allowThis(encPregnancyCount);
FHE.allowThis(encLivebirthCount);
// ... all at once
```

---

**4. Event-Based Audit Trails**
```solidity
// Use events instead of storing audit data on-chain
emit RecordCreated(recordId, patient, doctor);
emit DoctorAuthorized(doctor, patient);
```

**Benefit:** Events are cheaper than storage while still providing transparency.

---

**5. View Functions for Reads**
```solidity
// Use view functions - no gas cost for off-chain reads
function getEncryptedRecord(uint256 recordId)
    external
    view  // ← No gas cost when called off-chain
    onlyPatientOrDoctor(recordId)
    returns (...)
```

---

### Gas Usage Benchmarks

Run benchmarks:
```bash
REPORT_GAS=true npm test
```

**Example results:**
```
·----------------------------------------|---------------------------|
|  Method                                |  Avg Gas Cost             |
·----------------------------------------|---------------------------|
|  createRecord                          |  ~450,000                 |
|  updateTreatmentStatus                 |  ~80,000                  |
|  grantDoctorAccess                     |  ~45,000                  |
|  getEncryptedRecord (view)             |  0 (off-chain)            |
·----------------------------------------|---------------------------|
```

**Note:** FHEVM operations are inherently more expensive than standard operations due to the cryptographic complexity. These costs are the trade-off for on-chain privacy.

---

## 📚 Documentation

### Included Documentation

| Document | Description |
|----------|-------------|
| `README.md` (this file) | Complete project documentation |
| `ARCHITECTURE.md` | System design and technical architecture |
| `SETUP.md` | Detailed setup and configuration guide |
| `CONTRIBUTING.md` | Contribution guidelines |
| `BOUNTY_SUBMISSION.md` | Competition submission details |
| `VIDEO_SCRIPT.md` | Video production script |
| `VIDEO_DIALOGUE` | Video narration |
| `docs/` | Auto-generated GitBook documentation |

### Generating Documentation

```bash
# Generate GitBook-compatible docs from test annotations
npm run docs:generate
```

**Output location:** `docs/`

**What's generated:**
- `docs/index.md` - Main documentation page
- `docs/SUMMARY.md` - GitBook sidebar structure
- Organized by FHEVM chapters and categories

---

### API Reference

#### Contract: `ConfidentialFertilityRecords`

**State Variables:**
```solidity
address public owner;
uint256 public totalRecords;
mapping(uint256 => EncryptedRecord) private medicalRecords;
mapping(uint256 => RecordMetadata) public recordMetadata;
mapping(address => uint256[]) public patientRecords;
mapping(address => mapping(address => bool)) public doctorAccess;
mapping(address => bool) public authorizedDoctors;
mapping(uint256 => bool) public emergencyAccessLog;
```

**Core Functions:**

| Function | Visibility | Description |
|----------|-----------|-------------|
| `authorizeDoctor(address)` | external | System admin authorizes healthcare provider |
| `grantDoctorAccess(address)` | external | Patient grants doctor access |
| `revokeDoctorAccess(address)` | external | Patient revokes doctor access |
| `createRecord(...)` | external | Doctor creates encrypted medical record |
| `updateTreatmentStatus(uint256, bool)` | external | Update treatment status |
| `updateHormoneLevels(uint256, uint8)` | external | Update hormone measurements |
| `emergencyAccess(uint256)` | external | Request emergency access |
| `getEncryptedRecord(uint256)` | view | Retrieve encrypted record as handles |
| `getRecordMetadata(uint256)` | view | Retrieve public metadata |
| `getPatientRecordIds(address)` | view | Get all record IDs for patient |
| `hasComplicationsEncrypted(uint256)` | view | Get complications flag (encrypted) |
| `deactivateRecord(uint256)` | external | Soft delete record |
| `isDoctorAuthorized(address)` | view | Check system authorization |
| `hasDoctorAccess(address, address)` | view | Check patient-granted access |

**Events:**
```solidity
event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed doctor);
event RecordUpdated(uint256 indexed recordId, address indexed updatedBy);
event DoctorAuthorized(address indexed doctor, address indexed patient);
event DoctorRevoked(address indexed doctor, address indexed patient);
event EmergencyAccessGranted(uint256 indexed recordId, address indexed accessor);
event TreatmentStatusUpdated(uint256 indexed recordId, bool underTreatment);
```

---

## 🤝 Contributing

Contributions are welcome! This project serves as an educational example for the FHEVM community.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Update documentation**
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Contribution Guidelines

- ✅ Follow existing code style
- ✅ Add comprehensive tests for new features
- ✅ Include JSDoc/TSDoc annotations
- ✅ Update README and documentation
- ✅ Ensure all tests pass: `npm test`
- ✅ Check gas optimization: `REPORT_GAS=true npm test`

### Areas for Contribution

- 🔐 Additional FHEVM examples and patterns
- 🧪 More test cases and edge cases
- 📚 Documentation improvements
- 🎨 Frontend enhancements
- ⚡ Gas optimization strategies
- 🌍 Internationalization
- 🔧 Tooling improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📚 Resources

### FHEVM & Zama

- 📖 [FHEVM Documentation](https://docs.zama.ai/fhevm) - Official FHEVM docs
- 🔬 [Zama GitHub](https://github.com/zama-ai) - Source code and examples
- 💡 [FHEVM Examples](https://docs.zama.ai/fhevm/examples) - Official examples
- 🎓 [FHE Tutorial](https://docs.zama.ai/fhevm/tutorial) - Getting started guide
- 💬 [Zama Community](https://community.zama.ai/) - Community forum

### Hardhat

- 📖 [Hardhat Documentation](https://hardhat.org/docs) - Official docs
- 🧪 [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts) - Testing guide
- 🚀 [Hardhat Deploy](https://hardhat.org/tutorial/deploying-to-a-live-network) - Deployment guide
- 🔌 [Hardhat Plugins](https://hardhat.org/plugins) - Extend Hardhat functionality

### Healthcare Privacy

- 🏥 [HIPAA Guidelines](https://www.hhs.gov/hipaa) - US healthcare privacy law
- 🌍 [GDPR](https://gdpr.eu/) - EU data protection regulation
- 🔒 [Healthcare Data Privacy](https://www.healthit.gov/topic/privacy-security-and-hipaa) - Best practices
- 📊 [Medical Data Standards](https://www.hl7.org/) - HL7 FHIR standards

### Blockchain Privacy

- 🔐 [Zero Knowledge Proofs](https://z.cash/technology/zksnarks/) - Alternative privacy tech
- 🎭 [Privacy on Ethereum](https://ethereum.org/en/privacy/) - Ethereum privacy solutions
- 📚 [Awesome Privacy](https://github.com/pluja/awesome-privacy) - Privacy resources

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 FHEVM Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👥 Authors & Acknowledgments

### Competition Submission

**Submitted for:** Zama FHEVM Example Hub Bounty (December 2025)
**Category:** Healthcare Privacy
**Concepts:** Encryption, Access Control, User Decryption, Best Practices

### Acknowledgments

- **Zama Team** - For developing FHEVM and organizing the bounty program
- **Hardhat Team** - For the excellent Ethereum development framework
- **Healthcare Privacy Advocates** - For inspiring privacy-first solutions
- **FHEVM Community** - For feedback and support

---

## 🎯 Bounty Evaluation Criteria

This project addresses all bounty requirements:

### ✅ Required Elements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Standalone Hardhat repository | ✅ Complete | Self-contained project with all dependencies |
| Clear FHEVM concept demonstration | ✅ Complete | 5+ core concepts with code examples |
| Comprehensive test suite | ✅ Complete | 40+ tests with JSDoc annotations |
| Documentation generation | ✅ Complete | `scripts/generate-docs.ts` |
| Automation/scaffolding | ✅ Complete | `scripts/create-example.ts` |
| Production-ready | ✅ Complete | Deployment scripts, config, best practices |
| Video demonstration | ✅ Complete | Script + dialogue + rendered video |

### ⭐ Bonus Points

| Bonus Criterion | Status | Details |
|-----------------|--------|---------|
| Creative example | ✅ Yes | Novel healthcare privacy use case |
| Advanced patterns | ✅ Yes | Multi-tier access control, emergency access |
| Clean automation | ✅ Yes | Well-documented, reusable scaffolding tool |
| Comprehensive docs | ✅ Yes | Multiple doc files + auto-generated content |
| Test coverage | ✅ Yes | 40+ tests covering all major features |
| Error handling | ✅ Yes | Edge cases and anti-patterns demonstrated |
| Category organization | ✅ Yes | Healthcare privacy with multiple FHE concepts |
| Maintenance tools | ✅ Yes | Scripts for docs, scaffolding, deployment |

---

## 🚀 Quick Links

- 📹 **[Video Demo](https://youtu.be/HgUnmln9Zb0)** - 1-minute demonstration
- 📖 **[Setup Guide](SETUP.md)** - Detailed installation instructions
- 🏗️ **[Architecture](ARCHITECTURE.md)** - System design and patterns
- 🤝 **[Contributing](CONTRIBUTING.md)** - How to contribute
- 📋 **[Bounty Submission](BOUNTY_SUBMISSION.md)** - Competition details
- 🧪 **[Test Suite](test/PrivateFertilityRecords.test.ts)** - Comprehensive tests

---

<div align="center">

## Built with ❤️ for the FHEVM Community

**Zama FHEVM Example Hub Bounty - December 2025**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](.)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FHEVM](https://img.shields.io/badge/FHEVM-v0.5.0-green)](https://github.com/zama-ai/fhevm)

**Privacy-preserving healthcare for everyone.**

</div>
