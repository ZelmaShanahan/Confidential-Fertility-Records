# Gas Optimization Techniques for FHEVM

## Overview

FHEVM operations are more gas-intensive than standard Solidity operations due to the cryptographic complexity. This guide demonstrates optimization strategies to minimize gas costs while maintaining security and functionality.

## Gas Cost Comparison

### Standard Solidity vs FHEVM Operations

| Operation | Standard | FHEVM | Multiplier |
|-----------|----------|-------|-----------|
| Store uint8 | ~20,000 | ~50,000 | 2.5x |
| Store uint16 | ~20,000 | ~55,000 | 2.75x |
| Store uint32 | ~20,000 | ~60,000 | 3x |
| Addition | ~3,000 | ~25,000 | 8x |
| Comparison | ~3,000 | ~30,000 | 10x |

**Takeaway**: FHE operations cost 2-10x more gas, making optimization critical.

## Optimization Strategies

### 1. Pre-Encryption Input Validation

**Problem**: Encrypting invalid data wastes gas

```solidity
// ❌ BAD: ~50,000 gas wasted on invalid input
function createRecordBad(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age);        // Always encrypts
    require(_age > 0 && _age < 150, "Invalid"); // Fails after
}

// ✅ GOOD: Only ~3,000 gas on invalid input
function createRecordGood(uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid"); // Validates first
    euint8 encAge = FHE.asEuint8(_age);         // Only if valid
}
```

**Savings**: ~47,000 gas per invalid input (94% reduction)

### 2. Efficient Storage Layout

**Separate encrypted and non-encrypted data**:

```solidity
// ❌ BAD: Mixed storage (unnecessary encryption)
struct BadRecord {
    euint8 age;           // Encrypted (necessary)
    uint256 createdAt;    // Unencrypted timestamp
    euint8 count;         // Encrypted (necessary)
    address patient;      // Unencrypted address
}

// ✅ GOOD: Separated storage
struct EncryptedRecord {
    euint8 age;           // Only encrypted fields
    euint8 count;
}

struct RecordMetadata {
    uint256 createdAt;    // Only public fields
    address patient;
}
```

**Benefit**: Only encrypt sensitive data, save gas on public data

### 3. Batch Permission Setting

```solidity
// ❌ BAD: Multiple transactions
function grantAccessSeparately(uint256 recordId, address user) external {
    EncryptedRecord memory record = medicalRecords[recordId];

    // Each FHE.allow() is expensive
    FHE.allow(record.age, user);
    // User must call multiple times for each field
}

// ✅ GOOD: Batch permissions in one transaction
function grantAccessBatch(uint256 recordId, address user) external {
    EncryptedRecord memory record = medicalRecords[recordId];

    // All permissions in one function
    FHE.allow(record.age, user);
    FHE.allow(record.pregnancyCount, user);
    FHE.allow(record.cycleLength, user);
    FHE.allow(record.fertilityScore, user);
}
```

**Savings**: ~40,000 gas saved by avoiding 3 extra transactions

### 4. Event-Based Audit Trails

**Use events instead of storage for audit logs**:

```solidity
// ❌ BAD: Storage-based audit trail (expensive)
struct AuditLog {
    address accessor;
    uint256 timestamp;
    string action;
}
AuditLog[] public auditLogs; // Costs ~100,000 gas per entry

function accessRecord(uint256 recordId) external {
    // Store audit log
    auditLogs.push(AuditLog({
        accessor: msg.sender,
        timestamp: block.timestamp,
        action: "accessed"
    })); // ~100,000 gas

    // Access record
}

// ✅ GOOD: Event-based audit trail (cheap)
event RecordAccessed(
    uint256 indexed recordId,
    address indexed accessor,
    uint256 timestamp
);

function accessRecord(uint256 recordId) external {
    // Emit event
    emit RecordAccessed(
        recordId,
        msg.sender,
        block.timestamp
    ); // ~2,000 gas

    // Access record
}
```

**Savings**: ~98,000 gas per audit entry (98% reduction)

### 5. View Functions for Reads

```solidity
// ✅ GOOD: View functions are free for off-chain reads
function getEncryptedRecord(uint256 recordId)
    external
    view  // ← No gas cost when called off-chain
    onlyPatientOrDoctor(recordId)
    returns (bytes32 age, bytes32 count)
{
    EncryptedRecord memory record = medicalRecords[recordId];
    return (
        FHE.toBytes32(record.age),
        FHE.toBytes32(record.pregnancyCount)
    );
}
```

**Benefit**: Reading encrypted data is free when called off-chain

### 6. Choose Appropriate FHE Types

**Use smallest type that fits your data**:

```solidity
// ❌ BAD: Using larger types than necessary
euint32 age = FHE.asEuint32(28);           // ~60,000 gas
euint32 count = FHE.asEuint32(2);          // ~60,000 gas

// ✅ GOOD: Use appropriate sized types
euint8 age = FHE.asEuint8(28);             // ~50,000 gas (10k saved)
euint8 count = FHE.asEuint8(2);            // ~50,000 gas (10k saved)
```

**Savings**: ~20,000 gas for these two fields

### 7. Minimize Encrypted Comparisons

**Encrypted comparisons are expensive**:

```solidity
// ❌ BAD: Multiple encrypted comparisons
function isHighRisk(uint256 recordId) external view returns (ebool) {
    EncryptedRecord memory record = medicalRecords[recordId];

    // Each comparison costs ~30,000 gas
    ebool ageCheck = FHE.gt(record.age, FHE.asEuint8(40));
    ebool countCheck = FHE.gt(record.pregnancyCount, FHE.asEuint8(5));

    // Combining encrypted booleans is also expensive
    return FHE.and(ageCheck, countCheck);
}

// ✅ GOOD: Do plaintext checks where possible
function createRecord(uint8 _age, uint8 _count, ...) external {
    // Validate in plaintext before encrypting
    if (_age > 40 && _count > 5) {
        // Mark as high risk in metadata (plaintext)
        recordMetadata[recordId].isHighRisk = true;
    }

    // Then encrypt
    euint8 encAge = FHE.asEuint8(_age);
    euint8 encCount = FHE.asEuint8(_count);
}
```

**Benefit**: Avoid expensive encrypted comparisons when plaintext checks suffice

### 8. Soft Delete vs Hard Delete

```solidity
// ❌ BAD: Hard delete (complex, expensive)
function hardDeleteRecord(uint256 recordId) external {
    // Delete all encrypted data
    delete medicalRecords[recordId]; // Refund, but complex

    // Reorganize array (expensive)
    // Update mappings
}

// ✅ GOOD: Soft delete (simple, cheap)
function softDeleteRecord(uint256 recordId) external {
    // Just mark as inactive
    recordMetadata[recordId].isActive = false; // ~5,000 gas

    emit RecordDeactivated(recordId, msg.sender);
}
```

**Savings**: ~45,000+ gas for soft delete

### 9. Optimize Function Call Order

**Check cheapest conditions first**:

```solidity
// ❌ BAD: Expensive checks first
function updateRecord(uint256 recordId, uint8 _age) external {
    require(authorizedDoctors[msg.sender], "Not authorized"); // Expensive
    require(_age > 0 && _age < 150, "Invalid age");           // Cheap

    euint8 encAge = FHE.asEuint8(_age);
}

// ✅ GOOD: Cheap checks first
function updateRecord(uint256 recordId, uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid age");           // Cheap
    require(authorizedDoctors[msg.sender], "Not authorized"); // Expensive

    euint8 encAge = FHE.asEuint8(_age);
}
```

**Benefit**: Fail fast on invalid inputs, save gas on authorization check

### 10. Memory vs Storage

**Use memory for temporary encrypted values**:

```solidity
// ❌ BAD: Unnecessary storage reads/writes
function updateAge(uint256 recordId, uint8 _age) external {
    // Reading from storage
    medicalRecords[recordId].age = FHE.asEuint8(_age); // Expensive
}

// ✅ GOOD: Use memory for intermediate operations
function updateAge(uint256 recordId, uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid");

    // Create in memory
    euint8 encAge = FHE.asEuint8(_age);

    // Grant permissions in memory
    FHE.allowThis(encAge);
    FHE.allow(encAge, msg.sender);

    // Write to storage once
    medicalRecords[recordId].age = encAge;
}
```

## Gas Usage Benchmarks

Run gas reporting:

```bash
REPORT_GAS=true npm test
```

### Example Results

```
·----------------------------------------|---------------------------|
|  Solc version: 0.8.24                  ·  Optimizer enabled: true |
·----------------------------------------|---------------------------|
|  Method                                |  Avg Gas Cost             |
·----------------------------------------|---------------------------|
|  authorizeDoctor                       |  ~45,000                  |
|  grantDoctorAccess                     |  ~48,000                  |
|  createRecord                          |  ~450,000                 |
|  updateTreatmentStatus                 |  ~80,000                  |
|  updateHormoneLevels                   |  ~85,000                  |
|  getEncryptedRecord (view)             |  0 (off-chain)            |
|  deactivateRecord                      |  ~30,000                  |
·----------------------------------------|---------------------------|
```

### Optimization Impact

| Optimization | Gas Saved | % Reduction |
|--------------|-----------|-------------|
| Pre-validation | ~47,000 | 94% |
| Event-based audit | ~98,000 | 98% |
| Soft delete | ~45,000 | 60% |
| Appropriate FHE types | ~20,000 | 17% |
| Batch permissions | ~40,000 | 50% |

## Testing Gas Optimization

```typescript
describe("Gas Optimization", function () {
    it("should measure createRecord gas usage", async () => {
        const { contract, doctor } = await setup();

        const tx = await contract.connect(doctor).createRecord(
            28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
        );

        const receipt = await tx.wait();
        console.log(`Gas used: ${receipt.gasUsed}`);

        // Assert reasonable gas usage
        expect(receipt.gasUsed).to.be.lessThan(500000);
    });
});
```

## Best Practices Checklist

1. ✅ Validate inputs before encryption
2. ✅ Separate encrypted and public data
3. ✅ Batch FHE permissions in single transactions
4. ✅ Use events instead of storage for audit trails
5. ✅ Use view functions for reads
6. ✅ Choose smallest appropriate FHE types
7. ✅ Minimize encrypted comparisons
8. ✅ Prefer soft delete over hard delete
9. ✅ Order checks from cheapest to most expensive
10. ✅ Use memory for temporary values
11. ✅ Measure and track gas usage
12. ✅ Test gas costs regularly

## Gas Cost Summary

### Per-Operation Costs (Approximate)

| Operation | Gas Cost |
|-----------|----------|
| `FHE.asEuint8()` | ~50,000 |
| `FHE.asEuint16()` | ~55,000 |
| `FHE.asEuint32()` | ~60,000 |
| `FHE.asEbool()` | ~45,000 |
| `FHE.allowThis()` | ~25,000 |
| `FHE.allow()` | ~30,000 |
| `FHE.toBytes32()` (view) | 0 (off-chain) |
| `FHE.add()` | ~25,000 |
| `FHE.gt()` / `FHE.lt()` | ~30,000 |
| `require()` validation | ~3,000 |
| Event emission | ~2,000 |
| Storage write | ~20,000 |

### Function-Level Costs

| Function | Optimized | Unoptimized | Savings |
|----------|-----------|-------------|---------|
| Create record | ~450,000 | ~550,000 | ~100,000 |
| Update field | ~80,000 | ~120,000 | ~40,000 |
| Grant access | ~48,000 | ~65,000 | ~17,000 |
| Soft delete | ~30,000 | ~75,000 | ~45,000 |

## Related Concepts

- [Input Validation](input-validation.md) - Validate before encryption
- [Encryption](encryption.md) - Choose appropriate types
- [Testing](testing.md) - Measure gas usage

## Learn More

- [Solidity Gas Optimization](https://docs.soliditylang.org/en/latest/internals/optimizer.html)
- [FHEVM Performance Guide](https://docs.zama.ai/fhevm)
- [Hardhat Gas Reporter](https://github.com/cgewecke/hardhat-gas-reporter)
