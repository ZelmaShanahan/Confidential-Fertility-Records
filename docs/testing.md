# Comprehensive Test Suite

## Overview

The project includes 40+ comprehensive tests covering all FHEVM operations, access control patterns, and edge cases.

## Test Organization

### Test Categories

```
PrivateFertilityRecords (40+ tests)
├── Deployment (2 tests)
│   ├── Should set the correct owner
│   └── Should initialize with zero records
│
├── Healthcare Provider Authorization (3 tests)
│   ├── Should allow owner to authorize healthcare providers
│   ├── Should prevent unauthorized accounts from authorizing doctors
│   └── Should prevent duplicate authorization
│
├── Record Creation (6 tests)
│   ├── Should create encrypted record with valid data
│   ├── Should validate age before encryption
│   ├── Should validate fertility score range
│   ├── Should emit RecordCreated event
│   ├── Should reject invalid pregnancy counts
│   └── Should handle multiple records per patient
│
├── Access Control (6 tests)
│   ├── Should allow patient to grant doctor access
│   ├── Should prevent unauthorized access
│   ├── Should allow revoking doctor access
│   ├── Should check doctor authorization before data access
│   ├── Should prevent duplicate access grants
│   └── Should enforce multi-level permissions
│
├── Data Updates (6 tests)
│   ├── Should update treatment status
│   ├── Should update hormone levels
│   ├── Should emit update events
│   ├── Should prevent unauthorized updates
│   ├── Should maintain encryption during updates
│   └── Should track update history
│
├── Emergency Access (3 tests)
│   ├── Should grant emergency access when authorized
│   ├── Should log emergency access attempts
│   └── Should prevent unauthorized emergency access
│
├── Record Retrieval (6 tests)
│   ├── Should retrieve encrypted record with proper permissions
│   ├── Should return handles not plaintext
│   ├── Should prevent unauthorized retrieval
│   ├── Should retrieve multiple fields correctly
│   ├── Should validate record exists before retrieval
│   └── Should handle deactivated records
│
├── Record Deactivation (3 tests)
│   ├── Should allow patient to deactivate records
│   ├── Should prevent access to deactivated records
│   └── Should maintain deactivation state
│
├── Multi-Patient Isolation (3 tests)
│   ├── Should prevent cross-patient access
│   ├── Should maintain separate access lists
│   └── Should handle multiple patients independently
│
└── Gas Optimization (2 tests)
    ├── Should measure createRecord gas usage
    └── Should measure access control gas usage
```

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suite

```bash
npx hardhat test --grep "Access Control"
npx hardhat test --grep "Record Creation"
```

### With Gas Reporting

```bash
REPORT_GAS=true npm test
```

### With Coverage Report

```bash
npm run test:coverage
```

## Test Patterns

### Access Control Test

```typescript
/**
 * @title Should prevent unauthorized access to medical records
 * @description Demonstrates access control enforcement
 * @chapter access-control
 */
it("should prevent unauthorized access", async function () {
    const { contract, doctor, unauthorized, patient } = await loadFixture(deployFixture);

    // Setup: Authorize doctor
    await contract.authorizeDoctor(doctor.address);

    // Patient must grant access
    // (access not granted, so unauthorized should fail)

    // Test: Unauthorized access denied
    await expect(
        contract.connect(unauthorized).getEncryptedRecord(0)
    ).to.be.revertedWith("Access denied");
});
```

### Encryption Test

```typescript
/**
 * @title Should encrypt and store sensitive medical data
 * @description Demonstrates encrypted data storage using various FHE types
 * @chapter encryption
 */
it("should encrypt medical data with correct types", async function () {
    const { contract, doctor, patient } = await loadFixture(deployFixture);

    // Setup
    await contract.authorizeDoctor(doctor.address);

    // Create record with multiple encrypted fields
    const tx = await contract.connect(doctor).createRecord(
        28,    // age (euint8)
        2,     // pregnancyCount (euint8)
        1,     // livebirthCount (euint8)
        1,     // miscarriageCount (euint8)
        28,    // cycleLength (euint16)
        75,    // fertilityScore (euint8)
        1704067200, // lastPeriodDate (euint32)
        true,  // isUnderTreatment (ebool)
        false, // hasComplications (ebool)
        120,   // hormoneLevels (euint8)
        ""     // ipfsHash
    );

    // Verify event
    await expect(tx).to.emit(contract, "RecordCreated");

    // Verify encrypted storage
    const record = await contract.getEncryptedRecord(0);
    expect(record.age).to.not.be.undefined;
    expect(record.pregnancyCount).to.not.be.undefined;
});
```

### Event Test

```typescript
/**
 * @title Should emit events for all significant operations
 * @description Demonstrates event-based audit trail
 * @chapter best-practices
 */
it("should emit RecordCreated event with correct parameters", async function () {
    const { contract, doctor, patient } = await loadFixture(deployFixture);

    await contract.authorizeDoctor(doctor.address);

    const tx = await contract.connect(doctor).createRecord(28, 2, ...);

    await expect(tx)
        .to.emit(contract, "RecordCreated")
        .withArgs(0, patient.address, doctor.address);
});
```

### Permission Test

```typescript
/**
 * @title Should enforce FHE.allowThis() permissions
 * @description Demonstrates required contract permissions
 * @chapter access-control
 */
it("should grant contract access to encrypted values", async function () {
    const { contract, doctor, patient } = await loadFixture(deployFixture);

    await contract.authorizeDoctor(doctor.address);

    const tx = await contract.connect(doctor).createRecord(28, 2, ...);

    // Record created successfully means FHE.allowThis() was called
    await expect(tx).to.emit(contract, "RecordCreated");

    // Record can be retrieved (proving FHE permissions were set)
    const record = await contract.connect(patient).getEncryptedRecord(0);
    expect(record.age).to.not.be.undefined;
});
```

## Common Test Utilities

### Setup Fixture

```typescript
async function deployFixture() {
    const [owner, doctor, patient, unauthorized] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("ConfidentialFertilityRecords");
    const contract = await factory.deploy();
    const contractAddress = await contract.getAddress();

    return {
        contract,
        contractAddress,
        owner,
        doctor,
        patient,
        unauthorized
    };
}
```

### Expect Utilities

```typescript
// Check for reverts
await expect(action()).to.be.revertedWith("Error message");

// Check for events
await expect(action())
    .to.emit(contract, "EventName")
    .withArgs(arg1, arg2);

// Check equality
expect(value).to.equal(expectedValue);

// Check existence
expect(value).to.not.be.undefined;
```

## Testing Best Practices

1. ✅ Use descriptive test names
2. ✅ Add JSDoc annotations for documentation
3. ✅ Follow Arrange-Act-Assert pattern
4. ✅ Test both success and failure cases
5. ✅ Test edge cases and boundary conditions
6. ✅ Verify events are emitted correctly
7. ✅ Check for proper error messages
8. ✅ Test access control thoroughly
9. ✅ Measure and track gas usage
10. ✅ Keep tests focused and independent

## Coverage Report

Run coverage analysis:

```bash
npm run test:coverage
```

Expected coverage:
- **Statements**: 100%
- **Branches**: 95%+ (some error paths untested)
- **Functions**: 100%
- **Lines**: 100%

## Debugging Tests

### Enable Verbose Output

```bash
HARDHAT_VERBOSE=true npm test
```

### Run Single Test

```bash
npx hardhat test --grep "specific test name"
```

### Add Console Logging

```typescript
it("test with logging", async function () {
    const result = await contract.someFunction();
    console.log("Result:", result);
});
```

### Use Hardhat Console

```typescript
import { hardhat } from "hardhat";

it("test", async function () {
    console.log(hardhat);
});
```

## Related Documentation

- [Setup Guide](../SETUP.md) - Test environment setup
- [Developer Guide](../DEVELOPER_GUIDE.md) - Adding new tests
- [Architecture](../ARCHITECTURE.md) - Test structure
