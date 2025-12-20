# Pre-Encryption Input Validation

## Overview

This guide explains why and how to validate data **before** encryption in FHEVM contracts, demonstrating gas-efficient validation strategies.

## Why Validate Before Encryption?

### Problem: Encrypting Invalid Data Wastes Gas

```solidity
// ❌ BAD: Encrypts invalid data, then fails
function createRecord(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age); // Expensive operation
    require(_age > 0 && _age < 150, "Invalid age"); // Fails after encryption!
}
```

**Cost**: ~50,000 gas wasted on encryption before validation fails

### Solution: Validate First, Encrypt Later

```solidity
// ✅ GOOD: Validates before encryption
function createRecord(uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid age"); // Cheap check
    euint8 encAge = FHE.asEuint8(_age); // Only encrypt valid data
}
```

**Savings**: ~50,000 gas saved by failing early

## Validation Patterns

### Pattern 1: Range Validation

```solidity
function createRecord(
    uint8 _age,
    uint8 _pregnancyCount,
    uint8 _fertilityScore
) external {
    // Validate ranges BEFORE encrypting
    require(_age > 0 && _age < 150, "Invalid age");
    require(_pregnancyCount <= 20, "Invalid pregnancy count");
    require(_fertilityScore <= 100, "Invalid fertility score");

    // Now encrypt (only if all validations passed)
    euint8 encAge = FHE.asEuint8(_age);
    euint8 encCount = FHE.asEuint8(_pregnancyCount);
    euint8 encScore = FHE.asEuint8(_fertilityScore);
}
```

### Pattern 2: Type-Specific Validation

```solidity
function createRecord(
    uint16 _cycleLength,
    uint32 _timestamp,
    bool _isUnderTreatment
) external {
    // Validate cycle length (typical range: 21-35 days)
    require(_cycleLength >= 21 && _cycleLength <= 35, "Invalid cycle length");

    // Validate timestamp (not in future)
    require(_timestamp <= block.timestamp, "Future timestamp not allowed");

    // Boolean validation (implicit - already valid)
    // No need to validate booleans (only true/false possible)

    // Encrypt after validation
    euint16 encCycleLength = FHE.asEuint16(_cycleLength);
    euint32 encTimestamp = FHE.asEuint32(_timestamp);
    ebool encTreatment = FHE.asEbool(_isUnderTreatment);
}
```

### Pattern 3: Business Logic Validation

```solidity
function createRecord(
    uint8 _livebirthCount,
    uint8 _miscarriageCount,
    uint8 _pregnancyCount
) external {
    // Business logic: live births + miscarriages ≤ total pregnancies
    require(
        _livebirthCount + _miscarriageCount <= _pregnancyCount,
        "Inconsistent pregnancy counts"
    );

    // Validate individual ranges
    require(_livebirthCount <= 20, "Invalid livebirth count");
    require(_miscarriageCount <= 20, "Invalid miscarriage count");
    require(_pregnancyCount <= 20, "Invalid pregnancy count");

    // Encrypt after all validations pass
    euint8 encLivebirth = FHE.asEuint8(_livebirthCount);
    euint8 encMiscarriage = FHE.asEuint8(_miscarriageCount);
    euint8 encPregnancy = FHE.asEuint8(_pregnancyCount);
}
```

### Pattern 4: Address Validation

```solidity
function grantDoctorAccess(address doctor) external {
    // Validate address BEFORE checking authorization
    require(doctor != address(0), "Invalid doctor address");
    require(doctor != msg.sender, "Cannot grant self-access");

    // Now check authorization (potentially expensive)
    require(authorizedDoctors[doctor], "Doctor not authorized");

    // Grant access
    doctorAccess[msg.sender][doctor] = true;
}
```

## Gas Comparison

### Example: Record Creation

```solidity
// ❌ Without pre-validation
function createRecordBad(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age);        // ~50,000 gas
    require(_age > 0 && _age < 150, "Invalid"); // ~3,000 gas
    // If invalid: 53,000 gas wasted
}

// ✅ With pre-validation
function createRecordGood(uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid"); // ~3,000 gas
    euint8 encAge = FHE.asEuint8(_age);        // ~50,000 gas
    // If invalid: Only 3,000 gas used (50,000 saved!)
}
```

**Result**: 94% gas savings on invalid inputs

## Validation Strategies

### Strategy 1: Fail Fast

```solidity
function createRecord(...) external {
    // 1. Cheapest validations first
    require(msg.sender != address(0), "Invalid sender");

    // 2. Simple range checks
    require(_age > 0 && _age < 150, "Invalid age");

    // 3. Business logic checks
    require(_livebirths <= _pregnancies, "Inconsistent data");

    // 4. External calls (expensive)
    require(authorizedDoctors[msg.sender], "Not authorized");

    // 5. Finally, encrypt (most expensive)
    euint8 encAge = FHE.asEuint8(_age);
}
```

### Strategy 2: Group Related Validations

```solidity
function createRecord(...) external {
    // Group 1: Age validations
    require(_age > 0, "Age must be positive");
    require(_age < 150, "Age too high");

    // Group 2: Count validations
    require(_pregnancyCount <= 20, "Too many pregnancies");
    require(_livebirthCount <= _pregnancyCount, "Invalid livebirth count");

    // Group 3: Score validations
    require(_fertilityScore <= 100, "Score out of range");

    // Now encrypt
    euint8 encAge = FHE.asEuint8(_age);
    euint8 encCount = FHE.asEuint8(_pregnancyCount);
    euint8 encScore = FHE.asEuint8(_fertilityScore);
}
```

### Strategy 3: Use Modifiers for Common Validations

```solidity
modifier validAge(uint8 _age) {
    require(_age > 0 && _age < 150, "Invalid age");
    _;
}

modifier validScore(uint8 _score) {
    require(_score <= 100, "Score out of range");
    _;
}

function createRecord(uint8 _age, uint8 _score)
    external
    validAge(_age)        // Validates before function body
    validScore(_score)
{
    // Only reached if all validations pass
    euint8 encAge = FHE.asEuint8(_age);
    euint8 encScore = FHE.asEuint8(_score);
}
```

## Domain-Specific Validation

### Healthcare Domain Example

```solidity
// Medical data validation rules
function validateMedicalData(
    uint8 _age,
    uint8 _pregnancyCount,
    uint8 _livebirthCount,
    uint8 _miscarriageCount,
    uint16 _cycleLength,
    uint8 _fertilityScore,
    uint32 _lastPeriodDate
) internal view {
    // Age validation (reproductive age range)
    require(_age >= 18 && _age <= 50, "Age outside reproductive range");

    // Pregnancy count validation
    require(_pregnancyCount <= 20, "Pregnancy count unrealistic");

    // Outcome validation (must be consistent)
    require(
        _livebirthCount + _miscarriageCount <= _pregnancyCount,
        "Outcomes exceed total pregnancies"
    );

    // Cycle validation (typical range)
    require(
        _cycleLength >= 21 && _cycleLength <= 35,
        "Cycle length outside normal range"
    );

    // Score validation
    require(_fertilityScore <= 100, "Fertility score out of range");

    // Date validation (not in future)
    require(
        _lastPeriodDate <= block.timestamp,
        "Last period date cannot be in future"
    );
}

function createRecord(...) external {
    // Call validation function
    validateMedicalData(...);

    // Only encrypt after validation passes
    euint8 encAge = FHE.asEuint8(_age);
    // ...
}
```

## Common Pitfalls

### 1. Validating After Encryption

```solidity
// ❌ WRONG: Wastes gas on invalid input
function bad(uint8 _age) external {
    euint8 encAge = FHE.asEuint8(_age); // Always encrypts
    require(_age > 0, "Invalid");        // Fails after encryption
}

// ✅ CORRECT: Validates first
function good(uint8 _age) external {
    require(_age > 0, "Invalid");        // Fails early
    euint8 encAge = FHE.asEuint8(_age); // Only encrypts valid data
}
```

### 2. Incomplete Validation

```solidity
// ❌ WRONG: Missing upper bound check
function bad(uint8 _age) external {
    require(_age > 0, "Invalid age");
    euint8 encAge = FHE.asEuint8(_age); // Could overflow!
}

// ✅ CORRECT: Both bounds checked
function good(uint8 _age) external {
    require(_age > 0 && _age < 150, "Invalid age");
    euint8 encAge = FHE.asEuint8(_age);
}
```

### 3. Wrong Validation Order

```solidity
// ❌ WRONG: Expensive check first
function bad(uint8 _age) external {
    require(authorizedDoctors[msg.sender], "Not authorized"); // Expensive
    require(_age > 0, "Invalid age");                         // Cheap
    euint8 encAge = FHE.asEuint8(_age);
}

// ✅ CORRECT: Cheap check first
function good(uint8 _age) external {
    require(_age > 0, "Invalid age");                         // Cheap
    require(authorizedDoctors[msg.sender], "Not authorized"); // Expensive
    euint8 encAge = FHE.asEuint8(_age);
}
```

## Testing Validation

```typescript
describe("Input Validation", function () {
    it("should reject invalid age", async () => {
        const { contract, doctor } = await setup();

        await expect(
            contract.connect(doctor).createRecord(
                0,   // ❌ Invalid age (too low)
                2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
            )
        ).to.be.revertedWith("Invalid age");
    });

    it("should accept valid age", async () => {
        const { contract, doctor } = await setup();

        // ✅ Valid age (28)
        const tx = await contract.connect(doctor).createRecord(
            28, 2, 1, 1, 28, 75, 1704067200, true, false, 120, ""
        );

        await expect(tx).to.emit(contract, "RecordCreated");
    });
});
```

## Best Practices

1. ✅ Always validate inputs before encryption
2. ✅ Order validations from cheapest to most expensive
3. ✅ Use clear, specific error messages
4. ✅ Group related validations together
5. ✅ Consider domain-specific business rules
6. ✅ Test both valid and invalid inputs
7. ✅ Document validation requirements
8. ✅ Use modifiers for reusable validations
9. ✅ Fail fast on obviously invalid inputs
10. ✅ Measure gas savings from validation ordering

## Related Concepts

- [Encryption](encryption.md) - How to encrypt after validation
- [Gas Optimization](gas-optimization.md) - More gas-saving strategies
- [Testing](testing.md) - Testing validation logic

## Learn More

- [Solidity Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [Gas Optimization Guide](https://docs.soliditylang.org/en/latest/internals/optimizer.html)
