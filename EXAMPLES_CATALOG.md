# FHEVM Examples Catalog

This document lists all FHEVM example types that can be generated using the scaffolding tools, organized by category and complexity.

## Table of Contents

- [Current Example](#current-example)
- [Basic Examples](#basic-examples)
- [Encryption Examples](#encryption-examples)
- [Decryption Examples](#decryption-examples)
- [Access Control Examples](#access-control-examples)
- [Advanced Examples](#advanced-examples)
- [OpenZeppelin Integration](#openzeppelin-integration)
- [Real-World Use Cases](#real-world-use-cases)
- [How to Generate](#how-to-generate)

---

## Current Example

### Privacy-Preserving Medical Review System

**Category:** Access Control, Public Decryption, Real-World Use Cases

**Description:** A complete healthcare review platform where patients submit anonymous ratings for doctors. Individual ratings remain encrypted on-chain, and only aggregated averages are revealed after threshold decryption.

**FHEVM Concepts Demonstrated:**
- ✅ Access Control (`FHE.allowThis`, `FHE.allow`)
- ✅ Encrypted Storage (`euint8` ratings)
- ✅ Public Decryption Workflow (`FHE.requestDecryption`)
- ✅ Encrypted Aggregation
- ✅ Input Validation
- ✅ Rate Limiting

**Complexity:** Advanced

**Files:**
- Contract: `contracts/AnonymousMedicalReview.sol`
- Tests: `test/MedicalReview.test.js`
- 25+ test cases with comprehensive coverage

**Generate Command:**
```bash
npm run scaffold medical-review access-control
```

---

## Basic Examples

### 1. Simple FHE Counter

**Category:** Basic Operations

**Description:** Introduction to FHEVM with a simple encrypted counter that can be incremented and decremented using encrypted values.

**FHEVM Concepts:**
- Basic encrypted integers (`euint32`)
- FHE arithmetic (`FHE.add`, `FHE.sub`)
- Storage of encrypted values
- Access control basics

**Complexity:** Beginner

**Sample Code:**
```solidity
contract FHECounter {
    euint32 private counter;

    function increment(uint32 value) external {
        euint32 encrypted = FHE.asEuint32(value);
        counter = FHE.add(counter, encrypted);
        FHE.allowThis(counter);
    }
}
```

### 2. FHE Arithmetic Operations

**Category:** Basic Operations

**Description:** Demonstrates all FHE arithmetic operations: addition, subtraction, multiplication.

**FHEVM Concepts:**
- `FHE.add(a, b)` - Addition
- `FHE.sub(a, b)` - Subtraction
- `FHE.mul(a, b)` - Multiplication
- Type handling (`euint8`, `euint16`, `euint32`)

**Complexity:** Beginner

### 3. FHE Comparison Operations

**Category:** Basic Operations

**Description:** Shows encrypted comparison operations and conditional logic.

**FHEVM Concepts:**
- `FHE.eq(a, b)` - Equality
- `FHE.ne(a, b)` - Not equal
- `FHE.lt(a, b)` - Less than
- `FHE.gt(a, b)` - Greater than
- `FHE.select()` - Conditional selection

**Complexity:** Beginner

---

## Encryption Examples

### 4. Single Value Encryption

**Category:** Encryption Basics

**Description:** Learn how to encrypt a single value and store it on-chain.

**FHEVM Concepts:**
- `FHE.asEuint8()` - Encrypt plaintext
- Input validation before encryption
- Proper access control setup
- Common pitfalls to avoid

**Complexity:** Beginner

**Common Mistakes:**
```solidity
// ❌ BAD: Forgetting FHE.allowThis
euint8 value = FHE.asEuint8(42);

// ✅ GOOD: Proper access control
euint8 value = FHE.asEuint8(42);
FHE.allowThis(value);
FHE.allow(value, msg.sender);
```

### 5. Multiple Value Encryption

**Category:** Encryption Basics

**Description:** Handle encryption of multiple values in a single transaction.

**FHEVM Concepts:**
- Batch encryption
- Array handling with encrypted values
- Gas optimization for multiple encryptions
- Struct encryption patterns

**Complexity:** Intermediate

---

## Decryption Examples

### 6. User Decryption - Single Value

**Category:** User Decryption

**Description:** Allow users to decrypt their own encrypted values using the FHEVM client library.

**FHEVM Concepts:**
- Permission requirements for decryption
- Client-side decryption
- Proof generation
- Security considerations

**Complexity:** Intermediate

**Prerequisites:**
- User must have `FHE.allow()` permission
- Frontend integration required

### 7. User Decryption - Multiple Values

**Category:** User Decryption

**Description:** Decrypt multiple encrypted values at once for a user.

**FHEVM Concepts:**
- Batch decryption
- Handle array management
- Frontend integration patterns

**Complexity:** Intermediate

### 8. Public Decryption - Single Value

**Category:** Public Decryption

**Description:** Trigger threshold decryption to reveal a single encrypted value publicly.

**FHEVM Concepts:**
- `FHE.requestDecryption()`
- Callback function implementation
- `FHE.checkSignatures()`
- Decryption workflow

**Complexity:** Advanced

**Sample Code:**
```solidity
function requestReveal(euint32 encrypted) external {
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.sealoutput(encrypted);

    FHE.requestDecryption(
        cts,
        this.revealCallback.selector
    );
}

function revealCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    uint32 revealed = abi.decode(cleartexts, (uint32));
    // Use revealed value
}
```

### 9. Public Decryption - Multiple Values

**Category:** Public Decryption

**Description:** Decrypt multiple values in a single threshold decryption request.

**FHEVM Concepts:**
- Multi-value decryption
- Callback data parsing
- Aggregation patterns

**Complexity:** Advanced

---

## Access Control Examples

### 10. FHE Permission Patterns

**Category:** Access Control

**Description:** Comprehensive guide to FHE permission management.

**FHEVM Concepts:**
- `FHE.allowThis()` - Contract self-permission
- `FHE.allow(value, address)` - User permission
- `FHE.allowTransient()` - Temporary permission
- Permission lifecycle

**Complexity:** Intermediate

**Permission Matrix:**

| Function Type | FHE.allowThis() | FHE.allow() | When Needed |
|--------------|-----------------|-------------|-------------|
| Store encrypted value | ✅ Required | ✅ If user needs access | Always for storage |
| Compute on encrypted | ✅ Required | ❌ Not needed | For intermediate values |
| Return encrypted value | ✅ Required | ✅ Required | For user to decrypt |

### 11. Input Proof Validation

**Category:** Access Control

**Description:** Understanding and validating input proofs for encrypted inputs.

**FHEVM Concepts:**
- What are input proofs
- Why they're required
- How to validate them
- Zero-knowledge proof fundamentals

**Complexity:** Advanced

---

## Advanced Examples

### 12. Blind Auction

**Category:** Advanced Patterns

**Description:** Sealed-bid auction where bids remain encrypted until reveal phase.

**FHEVM Concepts:**
- Encrypted bid storage
- Comparison without revealing values
- Threshold reveal at auction end
- Winner determination

**Complexity:** Advanced

**Phases:**
1. Bidding - Encrypted bids submitted
2. Reveal - Threshold decryption triggered
3. Winner - Highest bidder determined

### 13. Confidential Voting System

**Category:** Advanced Patterns

**Description:** Anonymous voting with encrypted vote tallying.

**FHEVM Concepts:**
- Encrypted vote storage
- Vote aggregation without revealing individual votes
- Public result reveal
- Double-voting prevention

**Complexity:** Advanced

### 14. Privacy-Preserving Token Swap

**Category:** Advanced Patterns

**Description:** Swap tokens without revealing swap amounts.

**FHEVM Concepts:**
- Encrypted balance management
- Atomic swaps with FHE
- Price calculations on encrypted values

**Complexity:** Expert

---

## OpenZeppelin Integration

### 15. ERC7984 - Confidential Token Standard

**Category:** Token Standards

**Description:** Implementation of ERC7984 confidential ERC20 token standard.

**FHEVM Concepts:**
- Encrypted balance tracking
- Confidential transfers
- Allowance management with encryption
- Standard compliance

**Complexity:** Advanced

**Features:**
- Transfer without revealing amounts
- Balance inquiry (encrypted)
- Approve/TransferFrom with FHE

### 16. ERC7984 to ERC20 Wrapper

**Category:** Token Standards

**Description:** Wrapper to convert between confidential and regular tokens.

**FHEVM Concepts:**
- Bridging encrypted and plaintext values
- Decryption requirements for unwrapping
- Security considerations

**Complexity:** Advanced

### 17. Confidential Token Swap

**Category:** Token Standards

**Description:** Swap two ERC7984 confidential tokens.

**FHEVM Concepts:**
- Multi-token encrypted operations
- Atomic swap implementation
- Price oracles with FHE

**Complexity:** Expert

---

## Real-World Use Cases

### 18. Private Lending Protocol

**Category:** DeFi

**Description:** Lending/borrowing platform with encrypted balances and interest rates.

**FHEVM Concepts:**
- Encrypted collateral tracking
- Interest calculation on encrypted values
- Liquidation with privacy preservation

**Complexity:** Expert

### 19. Anonymous Employee Payroll

**Category:** Enterprise

**Description:** Payroll system where individual salaries remain confidential.

**FHEVM Concepts:**
- Encrypted salary storage
- Batch payment processing
- Total payroll aggregation (public)
- Individual confidentiality

**Complexity:** Advanced

### 20. Confidential Supply Chain

**Category:** Enterprise

**Description:** Track inventory and pricing without revealing sensitive business data.

**FHEVM Concepts:**
- Encrypted quantity tracking
- Price calculations
- Access control for different parties

**Complexity:** Expert

---

## How to Generate

### Generate Single Example

```bash
npm run scaffold <example-name> <category>
```

**Example:**
```bash
npm run scaffold medical-review "access-control"
```

### Generate Category (Multiple Examples)

To generate a project with multiple related examples:

```bash
node automation/create-fhevm-category.js <category> [output-dir]
```

**Categories Available:**
- `basic` - Basic FHE operations
- `encryption` - Encryption patterns
- `decryption` - Decryption patterns
- `access-control` - Permission management
- `advanced` - Complex use cases
- `tokens` - OpenZeppelin integrations

**Example:**
```bash
node automation/create-fhevm-category.js basic ../my-basic-examples
cd ../my-basic-examples
npm install
npm test
```

### Customize Generated Examples

After generation, you can customize:

1. **Contract Logic**
   - Edit `contracts/YourExample.sol`
   - Add custom functions
   - Modify state variables

2. **Tests**
   - Edit `test/YourExample.test.js`
   - Add test cases
   - Improve coverage

3. **Documentation**
   - Update README.md
   - Run `npm run generate-docs`

4. **Configuration**
   - Modify `hardhat.config.js`
   - Add networks
   - Configure plugins

---

## Example Difficulty Levels

### 🟢 Beginner
Simple concepts, minimal complexity, good starting point
- FHE Counter
- Basic Arithmetic
- Single Value Encryption

### 🟡 Intermediate
Multiple concepts, requires understanding of FHE basics
- Multiple Value Encryption
- User Decryption
- Access Control Patterns

### 🔴 Advanced
Complex workflows, multiple interacting concepts
- Public Decryption
- Blind Auction
- Medical Review System
- ERC7984 Tokens

### ⚫ Expert
Production-ready patterns, security-critical implementations
- Token Swaps
- Lending Protocols
- Supply Chain Systems

---

## Contributing New Examples

Want to add an example to this catalog?

1. **Create the Contract**
   - Write in `contracts/category/YourExample.sol`
   - Include detailed comments

2. **Write Tests**
   - Create `test/category/YourExample.test.js`
   - Cover all functionality

3. **Update Documentation**
   - Add to this EXAMPLES_CATALOG.md
   - Include in DEVELOPER_GUIDE.md

4. **Test Generation**
   - Verify scaffolding works
   - Test generated standalone repo

5. **Submit**
   - Create pull request
   - Include demo video

---

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity API Reference](https://docs.zama.ai/fhevm/solidity-api)
- [Example Implementations](https://github.com/zama-ai/fhevm-hardhat-template)
- [OpenZeppelin Confidential](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)

---

**Catalog Version:** 1.0
**Last Updated:** December 2025
**Total Examples:** 20 documented patterns
