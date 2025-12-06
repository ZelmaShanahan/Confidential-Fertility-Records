# Architecture Documentation

## System Overview

This document provides a detailed architectural overview of the Private Fertility Records FHEVM example, explaining design decisions, data flows, and security patterns.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Data Structures](#data-structures)
- [Access Control Model](#access-control-model)
- [Encryption Patterns](#encryption-patterns)
- [Event System](#event-system)
- [Frontend Architecture](#frontend-architecture)
- [Security Considerations](#security-considerations)
- [Gas Optimization Strategies](#gas-optimization-strategies)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Interface (HTML/JS)                  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Patient  │  │ Doctor   │  │ Records  │  │ Access   │  │
│  │ Portal   │  │ Portal   │  │ View     │  │ Control  │  │
│  └─────┬────┘  └─────┬────┘  └────┬─────┘  └────┬─────┘  │
└────────┼─────────────┼────────────┼────────────┼──────────┘
         │             │            │            │
         └─────────────┴────────────┴────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │      MetaMask / Web3        │
         │    (Transaction Signing)    │
         └─────────────┬───────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │      Blockchain Network      │
         │    (Sepolia / Zama Devnet)  │
         └─────────────┬───────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         ConfidentialFertilityRecords Smart Contract         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Encrypted   │  │   Access     │  │   Emergency  │    │
│  │   Records    │  │   Control    │  │    Access    │    │
│  │   Storage    │  │   System     │  │    System    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │              FHEVM Encryption Layer              │     │
│  │   (FHE.asEuint8, FHE.asEbool, FHE.allowThis)    │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Architecture

### Contract Inheritance

```solidity
ConfidentialFertilityRecords
    └── SepoliaConfig (from @fhevm/contracts)
```

The contract inherits from `SepoliaConfig` which provides FHEVM-specific configuration for the Sepolia testnet.

### Core Components

1. **Storage Layer**
   - `medicalRecords`: Encrypted medical data
   - `recordMetadata`: Public metadata
   - `patientRecords`: Patient-to-records mapping
   - `doctorAccess`: Access control mappings
   - `authorizedDoctors`: System-level authorization

2. **Access Control Layer**
   - `onlyOwner`: Contract owner operations
   - `onlyPatientOrDoctor`: Record access control
   - `onlyAuthorizedDoctor`: System authorization check

3. **Business Logic Layer**
   - Record creation and management
   - Access control operations
   - Emergency access handling
   - Data updates and queries

---

## Data Structures

### EncryptedRecord

```solidity
struct EncryptedRecord {
    euint8 age;                    // Patient age (encrypted)
    euint8 pregnancyCount;         // Number of pregnancies (encrypted)
    euint8 livebirthCount;         // Number of live births (encrypted)
    euint8 miscarriageCount;       // Number of miscarriages (encrypted)
    euint16 cycleLength;           // Cycle length in days (encrypted)
    euint8 fertilityScore;         // Fertility score 0-100 (encrypted)
    euint32 lastPeriodDate;        // Last period timestamp (encrypted)
    ebool isUnderTreatment;        // Treatment status (encrypted)
    ebool hasComplications;        // Complications flag (encrypted)
    euint8 hormoneLevels;          // Hormone levels 0-255 (encrypted)
    uint256 timestamp;             // Record creation time (public)
    bool isActive;                 // Active status (public)
}
```

**Design Decision:** All sensitive medical data is encrypted using appropriate FHEVM types, while metadata that doesn't reveal sensitive information remains public.

### RecordMetadata

```solidity
struct RecordMetadata {
    address patient;               // Patient wallet address
    address authorizedDoctor;      // Creating doctor's address
    uint256 createdAt;            // Creation timestamp
    uint256 lastUpdated;          // Last update timestamp
    bool emergencyAccess;         // Emergency access flag
    string ipfsHash;              // Additional documents hash
}
```

**Design Decision:** Metadata is public to enable record discovery and audit trails without exposing sensitive medical information.

---

## Access Control Model

### Three-Tier Authorization System

```
┌─────────────────────────────────────────────────────────┐
│                    Level 1: Owner                       │
│              (Contract Administrator)                   │
│                                                         │
│  Actions:                                              │
│  - Authorize doctors to use the system                 │
│  - System-wide configuration                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Level 2: Authorized Doctors                │
│           (Healthcare Providers)                        │
│                                                         │
│  Actions:                                              │
│  - Create medical records                              │
│  - Request patient access                              │
│  - Emergency access (logged)                           │
│  - Update medical data (with patient consent)          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                Level 3: Patients                        │
│               (Record Owners)                           │
│                                                         │
│  Actions:                                              │
│  - Grant doctor access                                 │
│  - Revoke doctor access                                │
│  - View their own records                              │
│  - Deactivate records                                  │
└─────────────────────────────────────────────────────────┘
```

### Access Control Flow

**Creating a Record:**
```
1. Doctor must be authorized (Level 2)
   ├─> Check: authorizedDoctors[msg.sender] == true
   └─> Fail: Revert with "Not an authorized doctor"

2. Record is created with patient ownership
   └─> Patient = tx.origin (actual initiator)

3. Creating doctor automatically has access
   └─> authorizedDoctor field set
```

**Accessing a Record:**
```
1. Check if user is the patient
   └─> If yes: Grant access

2. Check if user is the authorized doctor
   └─> If yes: Grant access

3. Check if patient granted access to this doctor
   └─> doctorAccess[patient][msg.sender] == true
   └─> If yes: Grant access

4. Otherwise: Revert with "Access denied"
```

---

## Encryption Patterns

### Data Encryption Flow

```
Plain Data → FHE.asEuint*() → Encrypted Data → FHE.allowThis() → Stored On-Chain
```

### Example: Creating Encrypted Record

```solidity
function createRecord(uint8 _age, ...) external onlyAuthorizedDoctor {
    // 1. Validate plain input
    require(_age > 0 && _age < 100, "Invalid age");

    // 2. Encrypt each field
    euint8 encAge = FHE.asEuint8(_age);
    euint8 encPregnancyCount = FHE.asEuint8(_pregnancyCount);
    // ... more encryptions

    // 3. Store encrypted data
    medicalRecords[recordId] = EncryptedRecord({
        age: encAge,
        pregnancyCount: encPregnancyCount,
        // ... more fields
    });

    // 4. Grant contract access to encrypted values
    FHE.allowThis(encAge);
    FHE.allowThis(encPregnancyCount);
    // ... more allowances
}
```

### Encryption Type Selection

| Data Type | FHEVM Type | Reason |
|-----------|------------|--------|
| Age (0-100) | `euint8` | Small range, 8 bits sufficient |
| Pregnancy Count | `euint8` | Typically low numbers |
| Cycle Length | `euint16` | Can be larger, needs 16 bits |
| Last Period Date | `euint32` | Timestamp, needs 32 bits |
| Treatment Status | `ebool` | Binary yes/no |

**Gas Optimization:** Using the smallest possible encrypted type reduces gas costs.

---

## Event System

### Event-Based Audit Trail

All state changes emit events for off-chain tracking and audit purposes:

```solidity
event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed doctor);
event RecordUpdated(uint256 indexed recordId, address indexed updatedBy);
event DoctorAuthorized(address indexed doctor, address indexed patient);
event DoctorRevoked(address indexed doctor, address indexed patient);
event EmergencyAccessGranted(uint256 indexed recordId, address indexed accessor);
event TreatmentStatusUpdated(uint256 indexed recordId, bool underTreatment);
```

### Event Usage Patterns

**Compliance & Audit:**
- `EmergencyAccessGranted`: Track all emergency accesses
- `RecordCreated`: Monitor new record creation
- `DoctorAuthorized/Revoked`: Track access control changes

**Frontend Integration:**
- Listen to events for real-time UI updates
- Build activity timelines
- Generate user notifications

---

## Frontend Architecture

### Web3 Integration

```javascript
// 1. Connect to MetaMask
provider = new ethers.providers.Web3Provider(window.ethereum);
signer = provider.getSigner();

// 2. Initialize contract
contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// 3. Initialize FHEVM
fheInstance = await window.fhevm.createInstance({
    chainId: SEPOLIA_CONFIG.chainId
});

// 4. Interact with contract
const tx = await contract.createRecord(...);
await tx.wait();
```

### Data Flow

```
User Input → Validation → Smart Contract → Encryption → Blockchain Storage
                                            ↓
                                    Event Emission
                                            ↓
                                    Frontend Update
```

---

## Security Considerations

### 1. **Encryption Security**

- All sensitive data encrypted using FHEVM
- Data never exists in plaintext on-chain
- Encryption happens at contract level (not client-side)

### 2. **Access Control**

- Multi-level authorization prevents unauthorized access
- Patient-centric control model
- Emergency access is logged for accountability

### 3. **Input Validation**

```solidity
// Validate BEFORE encryption to save gas
require(_age > 0 && _age < 100, "Invalid age");
require(_fertilityScore <= 100, "Invalid score");

// Then encrypt
euint8 encAge = FHE.asEuint8(_age);
```

### 4. **Reentrancy Protection**

- No external calls after state changes
- Follows checks-effects-interactions pattern
- No reentrancy vulnerabilities

### 5. **Front-Running Protection**

- FHEVM inherently protects against front-running
- Encrypted values cannot be observed in mempool
- Transaction order doesn't reveal sensitive data

---

## Gas Optimization Strategies

### 1. **Validate Before Encrypting**

```solidity
// ✅ Good: Validate first, encrypt later
require(_age > 0 && _age < 100, "Invalid age");
euint8 encAge = FHE.asEuint8(_age);

// ❌ Bad: Encrypt first, validate later
euint8 encAge = FHE.asEuint8(_age);
require(_age > 0 && _age < 100, "Invalid age");
```

**Why:** Encryption is expensive. Fail early on invalid input.

### 2. **Use Smallest Encrypted Types**

```solidity
// ✅ Good: Use euint8 for small numbers
euint8 age;              // 0-100 range
euint8 fertilityScore;   // 0-100 range

// ❌ Bad: Using oversized types
euint256 age;            // Wastes gas
euint256 fertilityScore; // Wastes gas
```

### 3. **Batch FHE.allowThis() Calls**

While we call `FHE.allowThis()` for each encrypted value, in production you might batch these operations.

### 4. **Event Indexing**

```solidity
// ✅ Indexed parameters for efficient filtering
event RecordCreated(
    uint256 indexed recordId,
    address indexed patient,
    address indexed doctor
);

// Maximum 3 indexed parameters per event
```

---

## Scalability Considerations

### Current Limitations

1. **On-Chain Storage:** All encrypted data stored on-chain
2. **Gas Costs:** FHEVM operations are more expensive than regular operations
3. **Decryption:** Client-side decryption requires gas

### Optimization Strategies

1. **IPFS Integration:** Store large documents off-chain
2. **Batching:** Combine multiple operations when possible
3. **Lazy Loading:** Load records on-demand
4. **Indexing:** Use The Graph for efficient queries

---

## Future Enhancements

### Potential Improvements

1. **Encrypted Queries**
   - Compare encrypted values without decryption
   - Statistical analysis on encrypted data

2. **Advanced Access Control**
   - Time-limited access grants
   - Delegation patterns
   - Multi-signature requirements

3. **Encrypted Computations**
   - Risk assessment on encrypted data
   - Encrypted analytics
   - Machine learning on encrypted data

4. **Cross-Chain Integration**
   - Bridge to other privacy-preserving chains
   - Multi-chain record synchronization

---

## Conclusion

This architecture provides a solid foundation for privacy-preserving healthcare applications using FHEVM. The multi-layered approach to security, combined with comprehensive access control and encryption patterns, demonstrates best practices for building confidential applications on blockchain.

The design balances:
- **Privacy:** Complete data encryption
- **Usability:** Intuitive access control
- **Security:** Multi-level authorization
- **Compliance:** Audit trails and emergency access
- **Efficiency:** Gas optimization strategies

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Bounty:** Zama FHEVM Example Hub (December 2025)
