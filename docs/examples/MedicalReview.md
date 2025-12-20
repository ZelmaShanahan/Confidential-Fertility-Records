# MedicalReview

Medical Review Contract Test Suite

**Categories:** `access-control`, `public-decryption`, `encrypted-computation`, `access-control`

## Test Cases

This example includes the following test cases:

### 1. Doctor registration emits correct event

**Demonstrates:** Platform-only access control (FHE.allowThis pattern)

### 2. Non-platform cannot register doctors

**Demonstrates:** Access control validation (onlyPlatform modifier)

### 3. Multiple doctor registration

**Demonstrates:** Sequential registration and ID management

### 4. Invalid rating values rejected

**Demonstrates:** Input validation (onlyValidRating modifier)

### 5. Duplicate reviews prevented

**Demonstrates:** State tracking and validation (hasReviewed mapping)

### 6. Comment length validation

**Demonstrates:** Input size constraints

### 7. Invalid doctor ID handling

**Demonstrates:** Doctor validation (onlyRegisteredDoctor modifier)

### 8. Multiple reviewers can review same doctor

**Demonstrates:** Multi-reviewer capability for aggregation

### 9. Aggregation request minimum review requirement

**Demonstrates:** Business logic validation for aggregation

### 10. Only one aggregation at a time

**Demonstrates:** Concurrent operation prevention

### 11. Aggregation cooldown period

**Demonstrates:** Time-based rate limiting

### 12. Retrieve doctor information

**Demonstrates:** Read operations on stored data

### 13. Doctor rating data structure

**Demonstrates:** Aggregated rating access before decryption

### 14. Review status tracking

**Demonstrates:** Personal review history tracking

### 15. Aggregation eligibility checker

**Demonstrates:** Complex state checking function

### 16. Unregistered doctor validation

**Demonstrates:** Error handling for invalid references

### 17. Empty comment handling

**Demonstrates:** Allowance of empty strings

### 18. Platform address update

**Demonstrates:** Administrative function with validation

### 19. Platform address zero validation

**Demonstrates:** Address validation for critical state

## Running the Example

```bash
npm test
```

## Related Concepts

- [Access Control](../concepts/access-control.md)
- [Public Decryption](../concepts/public-decryption.md)
- [Encrypted Computation](../concepts/encrypted-computation.md)
- [Access Control](../concepts/access-control.md)
