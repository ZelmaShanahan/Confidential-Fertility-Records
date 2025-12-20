# Automation Scripts

> Automation tools for FHEVM example generation and documentation

## Overview

This directory contains TypeScript-based automation scripts that enable:
- **Project Scaffolding** - Generate new FHEVM example projects
- **Documentation Generation** - Auto-generate GitBook-compatible docs
- **Deployment Automation** - Deploy contracts with verification

---

## Scripts

### 1. `create-example.ts` - Project Scaffolding Tool

Generates complete FHEVM example projects from templates.

**Usage:**
```bash
npm run scaffold
```

**Interactive Prompts:**
```
? Project name: MyFHEVMExample
? Description: My FHEVM privacy example
? FHEVM concepts: Encryption, Access Control
? Category: Privacy
```

**What It Does:**
1. ✅ Creates project directory structure
2. ✅ Copies base Hardhat template
3. ✅ Generates contract template with selected FHE operations
4. ✅ Creates test file with JSDoc annotations
5. ✅ Sets up configuration files (hardhat.config.ts, package.json)
6. ✅ Generates README with usage instructions
7. ✅ Installs dependencies
8. ✅ Creates initial documentation

**Generated Structure:**
```
MyFHEVMExample/
├── contracts/
│   └── MyContract.sol          # FHEVM contract with selected operations
├── test/
│   └── MyContract.test.ts      # Comprehensive tests with annotations
├── scripts/
│   └── deploy.ts               # Deployment script
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
└── README.md                   # Project documentation
```

**Contract Template Features:**
- Inherits from `ZamaEthereumConfig`
- Includes selected FHE operations (euint8, euint16, euint32, ebool)
- Implements access control patterns
- Includes permission management (FHE.allowThis, FHE.allow)
- Follows best practices

**Test Template Features:**
- JSDoc annotations for documentation generation
- Test fixtures with proper setup
- Access control test patterns
- Encryption/decryption examples
- Edge case coverage

**Customization Options:**
- Project name and description
- FHEVM concepts to demonstrate
- Category (DeFi, Healthcare, Privacy, Governance, etc.)
- Contract template selection

**Example:**
```bash
npm run scaffold

# Output:
✓ Creating project structure...
✓ Generating contract template...
✓ Creating test suite...
✓ Setting up configuration...
✓ Installing dependencies...
✓ Generating documentation...
✅ Project created successfully!

Next steps:
  cd MyFHEVMExample
  npm run compile
  npm test
```

---

### 2. `generate-docs.ts` - Documentation Generator

Auto-generates GitBook-compatible documentation from code annotations.

**Usage:**
```bash
npm run docs:generate
```

**What It Does:**
1. ✅ Parses JSDoc/TSDoc comments from test files
2. ✅ Extracts `@title`, `@description`, `@chapter`, `@category` tags
3. ✅ Generates markdown files organized by concept
4. ✅ Creates GitBook SUMMARY.md sidebar
5. ✅ Includes code examples and explanations
6. ✅ Groups examples by FHEVM chapter

**Annotation Format:**
```typescript
/**
 * @title Test Title
 * @description Clear description of what this test demonstrates
 * @chapter encryption|access-control|user-decryption|input-proof|best-practices
 * @category Test category
 *
 * **FHEVM Operations:**
 * - FHE.asEuint8() - Encrypts 8-bit values
 * - FHE.allowThis() - Grants contract permission
 *
 * **Example:**
 * ```solidity
 * euint8 encAge = FHE.asEuint8(28);
 * FHE.allowThis(encAge);
 * ```
 */
it("should demonstrate something", async function () {
    // Test implementation
});
```

**Generated Documentation:**
```
docs/
├── README.md                   # Main documentation
├── SUMMARY.md                  # GitBook sidebar structure
├── encryption.md               # Encryption guide
├── access-control.md           # Access control patterns
├── user-decryption.md          # Decryption guide
├── input-validation.md         # Validation strategies
├── gas-optimization.md         # Gas optimization
└── testing.md                  # Test suite overview
```

**Features:**
- Automatic categorization by FHEVM concept
- Code syntax highlighting
- Cross-references between related concepts
- Clear examples with explanations
- Best practices and anti-patterns

**Example Output:**
```markdown
# Encryption

## Overview
This guide demonstrates how to encrypt different types of data...

## Implementation Pattern
\`\`\`solidity
euint8 age = FHE.asEuint8(28);
FHE.allowThis(age);
\`\`\`

## Common Pitfalls
❌ Wrong: Encrypting before validation
✅ Correct: Validate first, then encrypt
```

---

### 3. `deploy.ts` - Deployment Automation

Automated contract deployment with verification.

**Usage:**
```bash
# Local deployment
npm run deploy

# Testnet deployment
npm run deploy:sepolia

# Mainnet deployment
npm run deploy:mainnet
```

**What It Does:**
1. ✅ Deploys contract to selected network
2. ✅ Waits for confirmation
3. ✅ Automatically verifies on Etherscan
4. ✅ Saves deployment address
5. ✅ Updates frontend configuration
6. ✅ Generates deployment summary

**Configuration:**
Reads from `.env` file:
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_api_key
```

**Output:**
```
Deploying ConfidentialFertilityRecords...
  ⏳ Deploying contract...
  ✅ Contract deployed to: 0x1234567890abcdef...
  ⏳ Verifying contract on Etherscan...
  ✅ Contract verified successfully!

📊 Deployment Summary:
  Contract: ConfidentialFertilityRecords
  Address: 0x1234567890abcdef...
  Network: sepolia
  Deployer: 0xabcdef...
  Gas used: 3,456,789

🔗 Next steps:
  1. Update CONTRACT_ADDRESS in public/index.html
  2. Test contract on Sepolia testnet
  3. Verify functionality with frontend
```

**Features:**
- Gas estimation
- Transaction confirmation tracking
- Automatic Etherscan verification
- Error handling and retries
- Deployment logging

---

## Development Workflow

### Creating a New FHEVM Example

**Step 1: Use Scaffolding Tool**
```bash
npm run scaffold
```

Follow the interactive prompts to generate your project.

**Step 2: Implement Contract Logic**
```bash
cd YourProject
# Edit contracts/YourContract.sol
# Implement your FHEVM operations
```

**Step 3: Write Tests with Annotations**
```typescript
// test/YourContract.test.ts

/**
 * @title Should encrypt and store data
 * @description Demonstrates basic FHE encryption
 * @chapter encryption
 */
it("should encrypt data", async function () {
    // Test implementation
});
```

**Step 4: Generate Documentation**
```bash
npm run docs:generate
```

**Step 5: Test Everything**
```bash
npm run compile
npm test
npm run test:coverage
```

**Step 6: Deploy**
```bash
# Local testing
npm run deploy

# Testnet
npm run deploy:sepolia
```

---

## Script Implementation Details

### create-example.ts

**Core Functions:**
- `generateProject()` - Main project generator
- `createDirectoryStructure()` - Creates folders
- `generateContractTemplate()` - Creates Solidity contract
- `generateTestTemplate()` - Creates test file
- `generateConfigFiles()` - Creates config files
- `installDependencies()` - Runs npm install
- `generateDocumentation()` - Creates initial docs

**Technologies:**
- TypeScript
- Node.js fs/path modules
- Interactive prompts (inquirer)
- Template string generation

### generate-docs.ts

**Core Functions:**
- `parseDocumentation()` - Parses JSDoc comments
- `extractAnnotations()` - Extracts @chapter, @title, etc.
- `generateMarkdown()` - Creates markdown files
- `generateSummary()` - Creates SUMMARY.md
- `organizeByChapter()` - Groups by FHEVM concept

**Technologies:**
- TypeScript
- Regular expressions for parsing
- Markdown generation
- File I/O operations

### deploy.ts

**Core Functions:**
- `deployContract()` - Deploys to network
- `verifyContract()` - Etherscan verification
- `saveDeployment()` - Saves addresses
- `updateConfig()` - Updates frontend config

**Technologies:**
- Ethers.js
- Hardhat runtime environment
- Etherscan API integration

---

## Configuration

### scripts/tsconfig.json (if needed)

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "esModuleInterop": true
  },
  "include": ["**/*.ts"]
}
```

### Environment Variables

Required for deployment:
```env
PRIVATE_KEY=                # Deployment account
SEPOLIA_RPC_URL=           # RPC endpoint
MAINNET_RPC_URL=           # RPC endpoint
ETHERSCAN_API_KEY=         # For verification
```

---

## Best Practices

### For create-example.ts

1. ✅ Generate minimal, clean code
2. ✅ Include comprehensive test templates
3. ✅ Add JSDoc annotations automatically
4. ✅ Follow FHEVM best practices
5. ✅ Include clear README instructions

### For generate-docs.ts

1. ✅ Parse all JSDoc annotations
2. ✅ Organize by FHEVM concept
3. ✅ Include code examples
4. ✅ Add cross-references
5. ✅ Generate clean, readable markdown

### For deploy.ts

1. ✅ Validate configuration before deployment
2. ✅ Show gas estimates
3. ✅ Wait for confirmations
4. ✅ Verify contracts automatically
5. ✅ Provide clear deployment summaries

---

## Troubleshooting

### Issue: "ts-node not found"

**Solution:**
```bash
npm install -g ts-node
# or
npx ts-node scripts/create-example.ts
```

### Issue: "Cannot find module"

**Solution:**
```bash
npm install
```

### Issue: Deployment fails

**Solution:**
1. Check `.env` configuration
2. Verify private key format (must start with 0x)
3. Ensure RPC URL is correct
4. Check account has sufficient funds

### Issue: Documentation not generating

**Solution:**
1. Ensure test files have JSDoc annotations
2. Check annotation format matches expected pattern
3. Verify file paths in script configuration

---

## Testing Scripts

### Manual Testing

```bash
# Test scaffolding
npm run scaffold
# Create test project

# Test documentation generation
npm run docs:generate
# Check docs/ directory

# Test deployment (local)
npm run deploy
# Verify contract deployed
```

### Automated Testing

```bash
# Run script tests
npm run test:scripts

# Test with CI/CD
npm run ci
```

---

## Extending the Scripts

### Adding New Contract Templates

**Edit `create-example.ts`:**

```typescript
const TEMPLATES = {
  'privacy': {
    contract: privacyContractTemplate,
    test: privacyTestTemplate,
    description: 'Privacy-preserving pattern'
  },
  // Add your template here
};
```

### Adding New Documentation Chapters

**Edit `generate-docs.ts`:**

```typescript
const CHAPTERS = {
  'encryption': { order: 1, title: 'Encryption' },
  'your-chapter': { order: 6, title: 'Your Chapter' },
};
```

---

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [GitBook Documentation](https://docs.gitbook.com)

---

## Support

For issues or questions:
1. Check [Developer Guide](../DEVELOPER_GUIDE.md)
2. Review [Architecture](../ARCHITECTURE.md)
3. See [Contributing Guidelines](../CONTRIBUTING.md)

---

**Last Updated**: December 2025
**FHEVM Version**: 0.9.1
**Hardhat Version**: 2.26.0
