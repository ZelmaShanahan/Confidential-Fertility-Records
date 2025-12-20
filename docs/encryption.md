# Encrypting Multiple Data Types

## Overview

This guide demonstrates how to encrypt different types of data in FHEVM smart contracts, specifically for healthcare applications.

## Encrypted Data Types

FHEVM provides several encrypted integer and boolean types:

| Type | Size | Use Case |
|------|------|----------|
| `euint8` | 8-bit | Ages, counts, scores (0-255) |
| `euint16` | 16-bit | Larger counts, measurements (0-65,535) |
| `euint32` | 32-bit | Timestamps, large values (0-4.2B) |
| `ebool` | Boolean | True/false flags |

## Implementation Pattern

### Contract Structure

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptionExample is ZamaEthereumConfig {
    struct EncryptedRecord {
        euint8 age;
        euint8 pregnancyCount;
        euint16 cycleLength;
        euint32 timestamp;
        ebool isUnderTreatment;
    }

    mapping(uint256 => EncryptedRecord) public records;
    uint256 public recordCount;

    function createRecord(
        uint8 _age,
        uint8 _pregnancyCount,
        uint16 _cycleLength,
        uint32 _timestamp,
        bool _isUnderTreatment
    ) external {
        // Validate inputs FIRST (before encryption)
        require(_age > 0 && _age < 150, "Invalid age");
        require(_pregnancyCount <= 20, "Invalid pregnancy count");
        require(_cycleLength >= 21 && _cycleLength <= 35, "Invalid cycle length");

        // Create encrypted record
        EncryptedRecord memory record = EncryptedRecord({
            age: FHE.asEuint8(_age),
            pregnancyCount: FHE.asEuint8(_pregnancyCount),
            cycleLength: FHE.asEuint16(_cycleLength),
            timestamp: FHE.asEuint32(_timestamp),
            isUnderTreatment: FHE.asEbool(_isUnderTreatment)
        });

        // Grant contract access to encrypted values
        FHE.allowThis(record.age);
        FHE.allowThis(record.pregnancyCount);
        FHE.allowThis(record.cycleLength);
        FHE.allowThis(record.timestamp);
        FHE.allowThis(record.isUnderTreatment);

        // Grant access to caller
        FHE.allow(record.age, msg.sender);
        FHE.allow(record.pregnancyCount, msg.sender);
        FHE.allow(record.cycleLength, msg.sender);
        FHE.allow(record.timestamp, msg.sender);
        FHE.allow(record.isUnderTreatment, msg.sender);

        records[recordCount] = record;
        recordCount++;
    }
}
```

## Key Points

### 1. **Input Validation Before Encryption**
```solidity
// ✅ CORRECT: Validate first, then encrypt
require(_age > 0 && _age < 150, "Invalid age");
euint8 encAge = FHE.asEuint8(_age);

// ❌ INCORRECT: Encrypting invalid data wastes gas
euint8 encAge = FHE.asEuint8(_age); // Could encrypt invalid value
```

### 2. **Proper Permission Granting**
```solidity
// ✅ CORRECT: Grant both contract and user permissions
FHE.allowThis(encryptedValue);           // Contract access
FHE.allow(encryptedValue, msg.sender);   // User access

// ❌ INCORRECT: Forgetting allowThis causes failures
FHE.allow(encryptedValue, msg.sender);   // Missing allowThis!
```

### 3. **Choosing the Right Type**
```solidity
// ✅ CORRECT: Use appropriate size
euint8 age = FHE.asEuint8(28);           // Age fits in 8-bit
euint16 cycleLength = FHE.asEuint16(28); // Larger range for measurements
euint32 timestamp = FHE.asEuint32(1704067200); // Timestamp needs 32-bit

// ❌ INCORRECT: Overflow risk with wrong type
euint8 timestamp = FHE.asEuint8(1704067200); // OVERFLOW! Value too large
```

## Common Pitfalls

### 1. Type Overflow
```solidity
// ❌ Problem: euint8 max is 255, but age could theoretically exceed
euint8 age = FHE.asEuint8(300); // Overflows to 44!

// ✅ Solution: Validate before encryption
require(_age <= 255, "Age out of range");
euint8 age = FHE.asEuint8(_age);
```

### 2. Missing Encryption
```solidity
// ❌ Problem: Storing plaintext with encrypted data is inconsistent
struct BadRecord {
    uint8 plainAge;           // Unencrypted - exposed!
    euint8 encryptedPassword; // Encrypted
}

// ✅ Solution: Encrypt all sensitive fields
struct GoodRecord {
    euint8 age;           // Encrypted
    euint8 passwordHash;  // Encrypted
}
```

### 3. Forgetting Permission Grants
```solidity
function transfer(uint256 id, address recipient) external {
    EncryptedRecord memory record = records[id];

    // ❌ Problem: recipient can't decrypt - no FHE.allow() call
    FHE.allowThis(record.age); // Only contract can use

    // ✅ Solution: Grant to both contract and recipient
    FHE.allowThis(record.age);
    FHE.allow(record.age, recipient);
}
```

## Gas Optimization

### Pre-Encryption Validation
```solidity
// ✅ Optimized: Early validation prevents expensive encryption of invalid data
function createRecord(uint8 _age, uint8 _count) external {
    require(_age > 0, "Invalid age"); // Cheap require
    require(_count <= 20, "Invalid count");

    // Only valid data gets encrypted
    euint8 encAge = FHE.asEuint8(_age); // Expensive operation
    euint8 encCount = FHE.asEuint8(_count);
}

// ❌ Wasteful: Encrypts even if validation fails
function createRecord(uint8 _age, uint8 _count) external {
    euint8 encAge = FHE.asEuint8(_age); // Always encrypted
    euint8 encCount = FHE.asEuint8(_count);

    require(_age > 0, "Invalid age"); // Checked after!
    require(_count <= 20, "Invalid count");
}
```

## Testing Encrypted Data

When testing encrypted records, use handles (bytes32) for retrieval:

```typescript
// Get encrypted value as handle
const encryptedValue = await contract.getEncryptedRecord(recordId);

// Client-side decryption using fhevmjs
import { createInstance } from "fhevmjs";

const fhevm = await createInstance({ chainId, publicKey });
const decrypted = await fhevm.decrypt(contractAddress, encryptedValue);

console.log("Decrypted value:", decrypted);
```

## Best Practices

1. ✅ Always validate inputs before encryption
2. ✅ Use appropriate sized types (euint8 for 0-255, euint16 for larger ranges)
3. ✅ Grant both contract and user permissions with `FHE.allowThis()` and `FHE.allow()`
4. ✅ Store encrypted data in structs, not individual state variables
5. ✅ Emit events for audit trails
6. ✅ Document which fields are encrypted in comments

## Related Concepts

- [Access Control](access-control.md) - How to control who can decrypt
- [User Decryption](user-decryption.md) - Safely retrieve encrypted data
- [Gas Optimization](gas-optimization.md) - Optimize encryption operations

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Encryption Best Practices](encryption-best-practices.md)
