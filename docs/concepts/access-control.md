# Access Control

## Understanding Access Control in FHEVM

Access control in FHEVM determines who can access encrypted values. This is crucial for maintaining privacy while allowing necessary operations.

### Key Concepts

- **FHE.allowThis()**: Grants the contract permission to access encrypted values
- **FHE.allow()**: Grants specific addresses permission to access encrypted values
- **FHE.allowTransient()**: Grants temporary access permissions

### When to Use

Use access control patterns when:
- Storing encrypted values that the contract needs to process later
- Allowing users to decrypt their own encrypted data
- Implementing role-based access to sensitive information

## Examples in this Category

### [MedicalReview](../examples/MedicalReview.md)

Medical Review Contract Test Suite

### [MedicalReview](../examples/MedicalReview.md)

Medical Review Contract Test Suite

