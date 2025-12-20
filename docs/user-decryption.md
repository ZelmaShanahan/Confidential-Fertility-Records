# Secure Data Retrieval - User Decryption

## Overview

This guide explains how to safely retrieve and decrypt encrypted data from the smart contract using proper permission patterns.

## Decryption Model

FHEVM uses a **handle-based decryption model**:

1. **Contract stores encrypted data** - `euint*` values
2. **Contract returns handles** - `bytes32` representation
3. **Client decrypts** - Using `fhevmjs` library
4. **Client needs permissions** - Both contract and user permission required

## Implementation Pattern

### Smart Contract: Returning Encrypted Data

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
    // Check access first (modifier does this)
    EncryptedRecord memory record = medicalRecords[recordId];

    // Convert encrypted values to bytes32 handles
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

**Key Points**:
- ✅ Access control applied FIRST (view modifier)
- ✅ Returns bytes32 handles, never plaintext
- ✅ Client receives opaque values
- ✅ Only authorized users can decrypt

### Client-Side: Decrypting Data

```typescript
import { createInstance } from "fhevmjs";

async function decryptMedicalRecord(contractAddress, recordId) {
    // 1. Initialize FHEVM instance
    const fhevm = await createInstance({
        chainId: 5, // Goerli testnet example
        publicKey: publicKey, // Your public key
    });

    // 2. Get contract instance
    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        signer
    );

    // 3. Retrieve encrypted handles from contract
    const encryptedRecord = await contract.getEncryptedRecord(recordId);

    // 4. Decrypt individual values
    const age = await fhevm.decrypt(contractAddress, encryptedRecord.age);
    const pregnancyCount = await fhevm.decrypt(contractAddress, encryptedRecord.pregnancyCount);
    const cycleLength = await fhevm.decrypt(contractAddress, encryptedRecord.cycleLength);

    // 5. Use decrypted values
    console.log({
        age,
        pregnancyCount,
        cycleLength
    });

    return {
        age,
        pregnancyCount,
        cycleLength
    };
}
```

## Permission Requirements

### Contract Permissions

The contract must grant permission to itself:

```solidity
function createRecord(...) external {
    EncryptedRecord memory record = EncryptedRecord({
        age: FHE.asEuint8(_age),
        // ...
    });

    // ✅ Grant contract access
    FHE.allowThis(record.age);

    // ✅ Grant user access
    FHE.allow(record.age, msg.sender);

    // Store record
    medicalRecords[recordCount] = record;
}
```

### User Permissions

The user (decryptor) must be explicitly allowed:

```solidity
// Only authorized users can decrypt
mapping(address => mapping(uint256 => bool)) public canDecrypt;

function grantDecryptAccess(uint256 recordId, address user) external {
    require(msg.sender == recordOwner[recordId], "Only owner");
    canDecrypt[user][recordId] = true;

    FHE.allow(medicalRecords[recordId].age, user);
}
```

## Common Patterns

### Pattern 1: Patient-Controlled Decryption

```solidity
// Patient can always decrypt their own data
function getMyRecord(uint256 recordId)
    external
    view
    returns (bytes32)
{
    require(recordOwner[recordId] == msg.sender, "Not your record");
    return FHE.toBytes32(medicalRecords[recordId].age);
}

// Patient grants doctor access
function grantDoctorDecryption(uint256 recordId, address doctor)
    external
{
    require(recordOwner[recordId] == msg.sender, "Not your record");
    FHE.allow(medicalRecords[recordId].age, doctor);

    emit DecryptionGranted(recordId, doctor);
}
```

### Pattern 2: Returning Multiple Values

```solidity
function getAllEncryptedFields(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)
    returns (
        bytes32[6] memory values
    )
{
    EncryptedRecord memory record = medicalRecords[recordId];

    values[0] = FHE.toBytes32(record.age);
    values[1] = FHE.toBytes32(record.pregnancyCount);
    values[2] = FHE.toBytes32(record.livebirthCount);
    values[3] = FHE.toBytes32(record.cycleLength);
    values[4] = FHE.toBytes32(record.fertilityScore);
    values[5] = FHE.toBytes32(record.isUnderTreatment);

    return values;
}
```

### Pattern 3: Conditional Decryption

```solidity
function getAgeIfAuthorized(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)
    returns (bytes32)
{
    // Only return if all conditions met
    require(
        recordMetadata[recordId].isActive,
        "Record inactive"
    );

    return FHE.toBytes32(medicalRecords[recordId].age);
}
```

## Decryption Workflow

```
┌─────────────────────────────────────────────┐
│ 1. Frontend: Call view function             │
│    contract.getEncryptedRecord(id)          │
└────────────────────┬────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 2. Contract: Check access                   │
│    ├─> Is caller authorized? YES ✓         │
│    └─> Return encrypted handles (bytes32)   │
└────────────────────┬────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 3. Client: Receive handles                  │
│    age = 0x123...                           │
│    pregnancyCount = 0x456...               │
└────────────────────┬────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 4. Client: Initialize FHEVM                 │
│    fhevm = createInstance(...)              │
└────────────────────┬────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 5. Client: Decrypt values                   │
│    age = fhevm.decrypt(contract, handle1)   │
│    count = fhevm.decrypt(contract, handle2) │
└────────────────────┬────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 6. Client: Use plaintext values             │
│    ✓ Now can read and display data          │
└─────────────────────────────────────────────┘
```

## Common Pitfalls

### 1. Returning Plaintext

```solidity
// ❌ WRONG: Defeats the purpose of encryption!
function getAge(uint256 recordId) external view returns (uint8) {
    return medicalRecords[recordId].age; // Returns plaintext!
}

// ✅ CORRECT: Return handle only
function getAge(uint256 recordId) external view returns (bytes32) {
    return FHE.toBytes32(medicalRecords[recordId].age);
}
```

### 2. Forgetting Access Control on View Functions

```solidity
// ❌ WRONG: Anyone can decrypt!
function getEncrypted(uint256 recordId) external view returns (bytes32) {
    return FHE.toBytes32(medicalRecords[recordId].age);
}

// ✅ CORRECT: Protect view functions
function getEncrypted(uint256 recordId)
    external
    view
    onlyPatientOrDoctor(recordId)  // ← Access control!
    returns (bytes32)
{
    return FHE.toBytes32(medicalRecords[recordId].age);
}
```

### 3. Missing FHE.allow() in Creation

```solidity
// ❌ WRONG: User can't decrypt because no permission granted
function createRecord(uint8 _age) external {
    EncryptedRecord memory record;
    record.age = FHE.asEuint8(_age);

    FHE.allowThis(record.age); // Contract permission only

    medicalRecords[0] = record;
}

// ✅ CORRECT: Grant both contract and user permissions
function createRecord(uint8 _age) external {
    EncryptedRecord memory record;
    record.age = FHE.asEuint8(_age);

    FHE.allowThis(record.age);        // Contract access
    FHE.allow(record.age, msg.sender); // User access

    medicalRecords[0] = record;
}
```

### 4. Trying to Decrypt in Contract

```solidity
// ❌ IMPOSSIBLE: Can't decrypt in contract
function unsafeGetAge(uint256 recordId) external view returns (uint8) {
    return uint8(medicalRecords[recordId].age); // DOESN'T WORK!
}

// ✅ CORRECT: Return handle, let client decrypt
function getSafeAge(uint256 recordId) external view returns (bytes32) {
    return FHE.toBytes32(medicalRecords[recordId].age);
}
```

## Testing Decryption

```typescript
import { createInstance } from "fhevmjs";

describe("Decryption", function () {
    it("should allow authorized users to decrypt", async () => {
        const { contract, doctor, patient } = await setup();

        // Doctor creates record
        await contract.connect(doctor).createRecord(28, ...);

        // Patient authorizes doctor
        await contract.connect(patient).grantDoctorAccess(doctor.address);

        // Doctor retrieves encrypted data
        const encrypted = await contract
            .connect(doctor)
            .getEncryptedRecord(0);

        // Initialize FHEVM
        const fhevm = await createInstance({...});

        // Decrypt value
        const age = await fhevm.decrypt(
            await contract.getAddress(),
            encrypted.age
        );

        expect(age).to.equal(28);
    });

    it("should deny unauthorized users from decryption", async () => {
        const { contract, doctor, unauthorized } = await setup();

        // Doctor creates record
        await contract.connect(doctor).createRecord(28, ...);

        // Unauthorized user cannot get encrypted data
        await expect(
            contract.connect(unauthorized).getEncryptedRecord(0)
        ).to.be.revertedWith("Access denied");
    });
});
```

## Best Practices

1. ✅ Always protect view functions with access control
2. ✅ Return bytes32 handles, never plaintext
3. ✅ Grant both contract and user permissions
4. ✅ Document which fields are encrypted
5. ✅ Validate permissions before returning data
6. ✅ Test with actual decryption in tests
7. ✅ Provide clear error messages for access denial
8. ✅ Consider privacy of who can view what fields

## Related Concepts

- [Encryption](encryption.md) - How data gets encrypted
- [Access Control](access-control.md) - Who can decrypt
- [Input Validation](input-validation.md) - Pre-encryption checks

## Learn More

- [FHEVM Decryption Guide](https://docs.zama.ai/fhevm)
- [FHEVMjs Documentation](https://www.npmjs.com/package/fhevmjs)
