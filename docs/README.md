# FHEVM Example: Privacy-Preserving Medical Review System

> **Zama Bounty:** December 2025 - Build FHEVM Example Hub
> **Categories:** Access Control, Public Decryption, Encrypted Computation
> **Status:** Competition Submission

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![FHEVM](https://img.shields.io/badge/Powered%20by-FHEVM-blue)](https://docs.zama.ai/fhevm)

## Overview

This project demonstrates a **privacy-preserving medical review system** built on FHEVM (Fully Homomorphic Encryption Virtual Machine) for the **Zama December 2025 Bounty Program**. It showcases how healthcare platforms can collect and aggregate doctor ratings while maintaining complete reviewer anonymity and data confidentiality through encrypted computation.

Video : privacy-preserving medical review system.mp4 https://streamable.com/z053ne

Live : https://privacy-preserving-medical-review-s.vercel.app/

### Key Features

- 🔒 **Anonymous Reviews**: Patients submit reviews without revealing their identity
- 🔐 **Encrypted Ratings**: All ratings stored as encrypted values (euint8) on-chain
- 📊 **Privacy-Preserving Aggregation**: Compute average ratings using FHE public decryption
- 🎯 **Access Control**: Demonstrates FHE.allow and FHE.allowThis patterns
- ⏱️ **Rate Limiting**: 7-day cooldown between rating aggregations
- ✅ **Comprehensive Tests**: 25+ test cases with TSDoc documentation

## FHEVM Concepts Demonstrated

### 1. Access Control Patterns

```solidity
// Allow contract to access encrypted values
FHE.allowThis(reviews[reviewCount].encryptedRating);

// Allow reviewer to decrypt their own submission
FHE.allow(reviews[reviewCount].encryptedRating, msg.sender);
```

**Learn:** How to properly grant permissions for encrypted value access using `FHE.allowThis()` and `FHE.allow()`.

### 2. Encrypted Value Operations

```solidity
// Encrypt plaintext ratings
euint8 encryptedRating = FHE.asEuint8(_rating);
euint8 encryptedProfessionalism = FHE.asEuint8(_professionalism);

// Store encrypted values
reviews[reviewCount] = Review({
    encryptedRating: encryptedRating,
    encryptedProfessionalism: encryptedProfessionalism,
    // ... other fields
});
```

**Learn:** Working with encrypted unsigned integers (euint8) for confidential data storage.

### 3. Public Decryption Workflow

```solidity
// Request decryption of multiple encrypted values
bytes32[] memory cts = new bytes32[](reviewsCount * 4);
// ... populate ciphertexts array

FHE.requestDecryption(cts, this.processAggregation.selector);

// Callback receives decrypted values
function processAggregation(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    // ... process decrypted values
}
```

**Learn:** Complete workflow for threshold decryption and secure aggregation.

### 4. Input Validation & Security

```solidity
modifier onlyValidRating(uint8 rating) {
    require(rating >= 1 && rating <= 5, "Rating must be between 1-5");
    _;
}

modifier onlyRegisteredDoctor(uint256 doctorId) {
    require(doctorId > 0 && doctorId <= doctorCount, "Invalid doctor ID");
    require(doctors[doctorId].isRegistered, "Doctor not registered");
    _;
}
```

**Learn:** Combining traditional Solidity validation with FHE operations.

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-anonymous-medical-review

# Install dependencies
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# Verbose output
npm run test:verbose

# With gas reporting
npm run test:gas

# Coverage report
npm run coverage
```

### Local Deployment

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy contract
npm run deploy:local
```

## Project Structure

```
fhevm-anonymous-medical-review/
├── contracts/
│   └── AnonymousMedicalReview.sol    # Main FHE contract
├── test/
│   └── MedicalReview.test.js         # Comprehensive test suite with TSDoc
├── scripts/
│   └── deploy.js                     # Deployment script
├── automation/
│   ├── create-fhevm-example.js       # Scaffolding CLI tool
│   └── generate-docs.js              # Documentation generator
├── docs/                             # Generated GitBook documentation
├── hardhat.config.js                 # Hardhat configuration
├── package.json                      # Project dependencies
└── README.md                         # This file
```

## Smart Contract Architecture

### Core Components

#### Doctor Registration

```solidity
function registerDoctor(
    string memory _name,
    string memory _specialty,
    string memory _clinic
) external onlyPlatform returns (uint256)
```

Platform-only function to register healthcare providers.

#### Anonymous Review Submission

```solidity
function submitAnonymousReview(
    uint256 _doctorId,
    uint8 _rating,
    uint8 _professionalism,
    uint8 _communication,
    uint8 _waitTime,
    string memory _encryptedComment
) external
```

Allows any address to submit encrypted ratings for a registered doctor.

#### Rating Aggregation

```solidity
function requestRatingAggregation(uint256 _doctorId) external
```

Initiates public decryption to compute and reveal average ratings (requires ≥3 reviews).

### Data Structures

```solidity
struct Review {
    uint256 doctorId;
    euint8 encryptedRating;           // 1-5 stars (encrypted)
    euint8 encryptedProfessionalism;  // 1-5 stars (encrypted)
    euint8 encryptedCommunication;    // 1-5 stars (encrypted)
    euint8 encryptedWaitTime;         // 1-5 stars (encrypted)
    string encryptedComment;          // Off-chain encrypted comment
    bool isSubmitted;
    uint256 timestamp;
    address reviewer;                 // Not linked to identity
}
```

## Testing

The project includes **25+ comprehensive test cases** covering:

### Test Categories

- ✅ **Doctor Registration** (3 tests)
- ✅ **Anonymous Review Submission** (6 tests)
- ✅ **Rating Aggregation & Decryption** (4 tests)
- ✅ **Information Retrieval** (4 tests)
- ✅ **Edge Cases & Error Handling** (4 tests)
- ✅ **FHE Access Control Patterns** (1 test)

### Running Specific Tests

```bash
# Run only access control tests
npx hardhat test --grep "Access Control"

# Run only decryption tests
npx hardhat test --grep "Decryption"
```

## Automation Tools

### 1. Scaffolding Tool

Create new FHEVM examples based on this template:

```bash
npm run scaffold <example-name> <category>
```

This generates a complete standalone repository with:
- Contract templates
- Test structure
- Deployment scripts
- Documentation setup

### 2. Documentation Generator

Generate GitBook-compatible docs from code comments:

```bash
npm run generate-docs
```

Output includes:
- API reference from contracts
- Concept pages from test categories
- Example walkthroughs
- Quick start guides

## Network Deployment

### Testnet (Sepolia)

1. **Setup environment:**

```bash
cp .env.template .env
```

2. **Configure `.env`:**

```env
PRIVATE_KEY=your_private_key_without_0x
INFURA_API_KEY=your_infura_api_key
```

3. **Deploy:**

```bash
npm run deploy
```

### Deployment Output

The deployment script saves detailed information to `deployment-info.json`:

```json
{
  "network": "sepolia",
  "contractAddress": "0x...",
  "deployerAddress": "0x...",
  "transactionHash": "0x...",
  "timestamp": "2025-12-05T...",
  "contractABI": [...]
}
```

## Use Cases

### 1. Healthcare Reviews

Patients submit confidential reviews of doctors, protecting their privacy while helping others make informed healthcare decisions.

### 2. Anonymous Feedback Systems

The pattern extends to employee reviews, course evaluations, or any scenario requiring confidential feedback aggregation.

### 3. Privacy-Preserving Ratings

E-commerce platforms, service providers, and content platforms can implement similar systems for product/service ratings.

## Security Considerations

### Access Control

- ✅ Only platform can register doctors (centralized onboarding)
- ✅ Anyone can submit reviews (permissionless participation)
- ✅ Encrypted values protected by FHE permissions
- ✅ Each reviewer can only review each doctor once

### Privacy Guarantees

- ✅ Individual ratings never revealed on-chain
- ✅ Aggregation requires minimum threshold (3 reviews)
- ✅ Comment encryption handled off-chain
- ✅ Reviewer addresses not linked to real identities

### Rate Limiting

- ✅ 7-day cooldown between aggregations
- ✅ Only one aggregation can run at a time
- ✅ Prevents rating manipulation through frequent re-aggregation

## Bounty Compliance Checklist

This submission meets all Zama December 2025 bounty requirements:

- ✅ **Hardhat-based**: Uses Hardhat for development and testing
- ✅ **Single Repository**: Standalone example (not monorepo)
- ✅ **Concise Structure**: Standard contracts/, test/, scripts/ layout
- ✅ **Scaffolding Tool**: `create-fhevm-example.js` CLI for new examples
- ✅ **Documentation Generator**: `generate-docs.js` creates GitBook docs
- ✅ **Comprehensive Tests**: 25+ tests with TSDoc annotations
- ✅ **Multiple Concepts**: Access control + public decryption + encryption
- ✅ **Clear Documentation**: README, code comments, generated docs
- ✅ **GitBook Compatible**: SUMMARY.md and structured markdown
- ✅ **Demo Video**: One-minute script provided in `ONE_MINUTE_VIDEO_DIALOGUE.md`

## Demo Video

A demo video showcasing this project is required for bounty submission. See `ONE_MINUTE_VIDEO_DIALOGUE.md` for the concise one-minute demonstration dialogue.

**Video Requirements:**
- Duration: 1 minute (concise version) or 5-10 minutes (detailed version)
- Show: Setup, compilation, testing, deployment
- Explain: Key FHE concepts demonstrated
- Highlight: Access control and decryption workflows

## Resources

### FHEVM Documentation

- [FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Solidity API Reference](https://docs.zama.ai/fhevm/solidity-api)

### Zama Resources

- [Zama Website](https://www.zama.ai/)
- [Bounty Program](https://github.com/zama-ai/bounty-program)
- [Community Discord](https://discord.gg/zama)
- [YouTube Channel](https://www.youtube.com/@zama_fhe)

### Example Implementations

- [Zama Example Repository](https://github.com/zama-ai/fhevm-hardhat-template)
- [Bounty Starter](https://github.com/zama-ai/bounty-december-2025-example)

## Contributing

Contributions welcome! Areas for improvement:

- Additional test cases for edge scenarios
- Integration with frontend dApp
- Support for more rating dimensions
- Multi-language support for documentation

### Development Setup

```bash
# Install dev dependencies
npm install

# Run linter
npm run lint

# Format code
npm run format

# Generate coverage
npm run coverage
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Zama Team** for FHEVM and the bounty program
- **OpenZeppelin** for Solidity patterns and best practices
- **Hardhat** for excellent development tools

## Contact

For questions about this submission:

- GitHub Issues: Open an issue in the repository
- Discord: Join [Zama Discord](https://discord.gg/zama)

---

**Built for the Zama December 2025 Bounty Program**

*Demonstrating privacy-preserving healthcare technology through Fully Homomorphic Encryption*
