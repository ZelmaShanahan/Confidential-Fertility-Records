# Anti-Patterns and Common Mistakes

## Overview

This guide demonstrates common mistakes developers make when implementing FHEVM contracts and how to avoid them.

## 1. Encryption Anti-Patterns

### ❌ Anti-Pattern: Encrypting After Validation Fails

```solidity
// WRONG: Wastes gas encrypting invalid data
function createRecord(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age); // ~50,000 gas
    require(_age > 0 && _age < 150, "Invalid"); // Fails after encryption!
}
```

**Why it's bad**: If validation fails, you've already spent ~50,000 gas on encryption.

**✅ Solution: Validate First**

```solidity
function createRecord(uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid"); // Only ~3,000 gas
    euint8 encAge = FHE.asEuint8(_age); // Only encrypt valid data
}
```

**Savings**: ~47,000 gas per invalid input

---

### ❌ Anti-Pattern: Using Wrong FHE Type

```solidity
// WRONG: Using euint32 for age (wastes gas)
euint32 age = FHE.asEuint32(28); // ~60,000 gas

// WRONG: Using euint8 for timestamp (overflow!)
euint8 timestamp = FHE.asEuint8(1704067200); // OVERFLOWS!
```

**✅ Solution: Use Appropriate Type**

```solidity
// Correct: euint8 for age (0-255 sufficient)
euint8 age = FHE.asEuint8(28); // ~50,000 gas (saves 10k)

// Correct: euint32 for timestamp
euint32 timestamp = FHE.asEuint32(1704067200); // No overflow
```

---

### ❌ Anti-Pattern: Forgetting to Encrypt Sensitive Data

```solidity
// WRONG: Mixing encrypted and unencrypted sensitive data
struct BadRecord {
    euint8 encryptedAge;
    uint8 unencryptedPassword; // EXPOSED!
    euint8 encryptedScore;
}
```

**✅ Solution: Encrypt All Sensitive Fields**

```solidity
struct GoodRecord {
    euint8 encryptedAge;
    euint8 encryptedPassword; // Now encrypted
    euint8 encryptedScore;
}
```

---

## 2. Access Control Anti-Patterns

### ❌ Anti-Pattern: Missing FHE.allowThis()

```solidity
// WRONG: User permission without contract permission
function createRecord(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age);

    // Missing FHE.allowThis()!
    FHE.allow(encAge, msg.sender); // WILL FAIL!

    records[0] = encAge;
}
```

**Why it fails**: Contract needs permission to use encrypted value in storage.

**✅ Solution: Grant Both Permissions**

```solidity
function createRecord(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age);

    FHE.allowThis(encAge); // Contract permission
    FHE.allow(encAge, msg.sender); // User permission

    records[0] = encAge;
}
```

---

### ❌ Anti-Pattern: No Access Control on View Functions

```solidity
// WRONG: Anyone can retrieve encrypted data
function getRecord(uint256 recordId)
    external
    view
    returns (bytes32)
{
    return FHE.toBytes32(records[recordId]);
}
```

**Why it's bad**: While data is encrypted, anyone can get the handle and try to decrypt.

**✅ Solution: Protect View Functions**

```solidity
function getRecord(uint256 recordId)
    external
    view
    onlyAuthorized(recordId) // Access control!
    returns (bytes32)
{
    return FHE.toBytes32(records[recordId]);
}
```

---

### ❌ Anti-Pattern: Single-Level Access Control

```solidity
// WRONG: Only checks if doctor is authorized
modifier onlyDoctor() {
    require(authorizedDoctors[msg.sender], "Not doctor");
    _;
}

function getRecord(uint256 recordId)
    external
    view
    onlyDoctor // But does patient consent?
    returns (bytes32)
{
    return FHE.toBytes32(records[recordId]);
}
```

**✅ Solution: Multi-Level Authorization**

```solidity
modifier onlyAuthorizedForRecord(uint256 recordId) {
    // Level 1: System authorization
    require(authorizedDoctors[msg.sender], "Not authorized");

    // Level 2: Patient permission
    require(
        msg.sender == recordOwner[recordId] ||
        patientGrants[recordOwner[recordId]][msg.sender],
        "No patient permission"
    );
    _;
}
```

---

## 3. Decryption Anti-Patterns

### ❌ Anti-Pattern: Returning Plaintext

```solidity
// WRONG: Defeats the purpose of encryption!
function getAge(uint256 recordId)
    external
    view
    returns (uint8)
{
    return records[recordId].age; // Returns plaintext!
}
```

**✅ Solution: Return Encrypted Handle**

```solidity
function getAge(uint256 recordId)
    external
    view
    onlyAuthorized(recordId)
    returns (bytes32)
{
    return FHE.toBytes32(records[recordId].age);
}
```

---

### ❌ Anti-Pattern: Trying to Decrypt in Contract

```solidity
// WRONG: Cannot decrypt in smart contract
function compareAge(uint256 recordId, uint8 threshold)
    external
    view
    returns (bool)
{
    uint8 age = uint8(records[recordId].age); // DOESN'T WORK!
    return age > threshold;
}
```

**✅ Solution: Use FHE Operations**

```solidity
function compareAge(uint256 recordId, uint8 threshold)
    external
    view
    onlyAuthorized(recordId)
    returns (ebool)
{
    euint8 encThreshold = FHE.asEuint8(threshold);
    return FHE.gt(records[recordId].age, encThreshold);
}
```

---

## 4. Gas Optimization Anti-Patterns

### ❌ Anti-Pattern: Expensive Checks First

```solidity
// WRONG: Most expensive check first
function updateRecord(uint256 recordId, uint8 _age) external {
    require(authorizedDoctors[msg.sender], "Not authorized"); // Expensive
    require(_age > 0, "Invalid age"); // Cheap

    euint8 encAge = FHE.asEuint8(_age);
}
```

**✅ Solution: Cheap Checks First (Fail Fast)**

```solidity
function updateRecord(uint256 recordId, uint8 _age) external {
    require(_age > 0, "Invalid age"); // Cheap first
    require(authorizedDoctors[msg.sender], "Not authorized"); // Expensive after

    euint8 encAge = FHE.asEuint8(_age);
}
```

---

### ❌ Anti-Pattern: Storing Audit Data On-Chain

```solidity
// WRONG: Expensive storage for audit trail
struct AuditLog {
    address accessor;
    uint256 timestamp;
    string action;
}
AuditLog[] public auditLogs; // ~100,000 gas per entry!
```

**✅ Solution: Use Events for Audit Trail**

```solidity
event RecordAccessed(
    uint256 indexed recordId,
    address indexed accessor,
    uint256 timestamp
);

function accessRecord(uint256 recordId) external {
    emit RecordAccessed(recordId, msg.sender, block.timestamp); // ~2,000 gas
}
```

**Savings**: ~98,000 gas per audit entry

---

## 5. Testing Anti-Patterns

### ❌ Anti-Pattern: Not Testing Edge Cases

```solidity
// Test only happy path
it("should create record", async () => {
    await contract.createRecord(28, 2, 1); // Only valid input
    // Missing: age=0, age=256, overflow tests
});
```

**✅ Solution: Test Edge Cases**

```typescript
describe("Record Creation", function () {
    it("should create valid record", async () => {
        await contract.createRecord(28, 2, 1);
    });

    it("should reject age = 0", async () => {
        await expect(
            contract.createRecord(0, 2, 1)
        ).to.be.revertedWith("Invalid age");
    });

    it("should reject age >= 150", async () => {
        await expect(
            contract.createRecord(150, 2, 1)
        ).to.be.revertedWith("Invalid age");
    });
});
```

---

### ❌ Anti-Pattern: Not Testing Access Control

```typescript
// Test only authorized access
it("should get record", async () => {
    const record = await contract.connect(authorized).getRecord(0);
    expect(record).to.not.be.undefined;
});
```

**✅ Solution: Test Both Authorized and Unauthorized**

```typescript
it("should allow authorized access", async () => {
    const record = await contract.connect(authorized).getRecord(0);
    expect(record).to.not.be.undefined;
});

it("should deny unauthorized access", async () => {
    await expect(
        contract.connect(unauthorized).getRecord(0)
    ).to.be.revertedWith("Access denied");
});
```

---

## 6. Event Anti-Patterns

### ❌ Anti-Pattern: No Events for Critical Operations

```solidity
// WRONG: No audit trail
function grantDoctorAccess(address doctor) external {
    doctorAccess[msg.sender][doctor] = true;
    // No event emitted!
}
```

**✅ Solution: Emit Events**

```solidity
event DoctorAccessGranted(
    address indexed patient,
    address indexed doctor,
    uint256 timestamp
);

function grantDoctorAccess(address doctor) external {
    doctorAccess[msg.sender][doctor] = true;

    emit DoctorAccessGranted(
        msg.sender,
        doctor,
        block.timestamp
    );
}
```

---

## 7. Security Anti-Patterns

### ❌ Anti-Pattern: No Input Validation

```solidity
// WRONG: No validation
function grantAccess(address doctor) external {
    // What if doctor = address(0)?
    // What if doctor = msg.sender?
    doctorAccess[msg.sender][doctor] = true;
}
```

**✅ Solution: Validate Inputs**

```solidity
function grantAccess(address doctor) external {
    require(doctor != address(0), "Invalid address");
    require(doctor != msg.sender, "Cannot grant to self");
    require(authorizedDoctors[doctor], "Not system-authorized");

    doctorAccess[msg.sender][doctor] = true;
}
```

---

### ❌ Anti-Pattern: Reentrancy Vulnerabilities

```solidity
// WRONG: State change after external call
function withdraw() external {
    uint256 amount = balances[msg.sender];

    (bool success, ) = msg.sender.call{value: amount}(""); // External call
    require(success, "Transfer failed");

    balances[msg.sender] = 0; // State change AFTER call!
}
```

**✅ Solution: Checks-Effects-Interactions Pattern**

```solidity
function withdraw() external {
    uint256 amount = balances[msg.sender];

    balances[msg.sender] = 0; // State change FIRST

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

---

## Quick Reference: Do's and Don'ts

### Encryption

- ✅ Validate before encrypting
- ✅ Use appropriate FHE types
- ✅ Encrypt all sensitive data
- ❌ Don't encrypt after validation fails
- ❌ Don't use wrong type sizes
- ❌ Don't mix encrypted and plaintext sensitive data

### Access Control

- ✅ Grant both FHE.allowThis() and FHE.allow()
- ✅ Protect view functions
- ✅ Multi-level authorization
- ❌ Don't forget FHE.allowThis()
- ❌ Don't leave view functions unprotected
- ❌ Don't use single-level auth for sensitive data

### Decryption

- ✅ Return encrypted handles (bytes32)
- ✅ Use FHE operations for comparisons
- ✅ Decrypt client-side only
- ❌ Don't return plaintext
- ❌ Don't try to decrypt in contract
- ❌ Don't expose encrypted values without auth

### Gas Optimization

- ✅ Cheap validations first
- ✅ Use events for audit trails
- ✅ Batch operations
- ❌ Don't do expensive checks first
- ❌ Don't store audit logs on-chain
- ❌ Don't use larger types than needed

### Testing

- ✅ Test edge cases
- ✅ Test access control (both sides)
- ✅ Test with invalid inputs
- ❌ Don't test only happy paths
- ❌ Don't skip unauthorized access tests
- ❌ Don't ignore boundary conditions

### Events & Audit

- ✅ Emit events for all state changes
- ✅ Index important parameters
- ✅ Include timestamps
- ❌ Don't skip events
- ❌ Don't omit audit trails
- ❌ Don't make events too generic

## Testing Your Code for Anti-Patterns

Use this checklist:

```typescript
describe("Anti-Pattern Check", function () {
    // ✅ Validation before encryption
    it("validates before encrypting");

    // ✅ Access control on all functions
    it("denies unauthorized access");

    // ✅ Returns handles not plaintext
    it("returns encrypted handles");

    // ✅ Emits events for state changes
    it("emits event on state change");

    // ✅ Tests edge cases
    it("handles boundary conditions");
});
```

## Learn More

- [Encryption Best Practices](encryption.md)
- [Access Control Patterns](access-control.md)
- [Gas Optimization](gas-optimization.md)
- [Testing Strategies](testing.md)
