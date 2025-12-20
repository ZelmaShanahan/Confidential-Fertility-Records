# Public Decryption

## Public Decryption Workflow

Public decryption allows encrypted values to be decrypted and made available on-chain after a threshold of decryption shares have been collected.

### Key Concepts

- **FHE.requestDecryption()**: Initiates the decryption process
- **Callback Function**: Receives decrypted values after threshold is met
- **Decryption Proof**: Cryptographic proof of correct decryption

### When to Use

Use public decryption when:
- Aggregating encrypted values for public results
- Implementing threshold-based reveals
- Creating privacy-preserving voting or auction systems

## Examples in this Category

### [MedicalReview](../examples/MedicalReview.md)

Medical Review Contract Test Suite

