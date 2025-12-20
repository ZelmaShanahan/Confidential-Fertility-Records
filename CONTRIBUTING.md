# Contributing to FHEVM Examples

Thank you for your interest in contributing to this FHEVM example project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

### Our Standards

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Collaborative**: Work together to improve the project
- **Be Patient**: Remember that everyone is learning

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal attacks
- Publishing others' private information

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git installed
- Basic understanding of:
  - Solidity
  - Ethereum/Hardhat
  - FHEVM concepts
  - Testing with Chai

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/fhevm-anonymous-medical-review
   cd fhevm-anonymous-medical-review
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/fhevm-anonymous-medical-review
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Verify setup**:
   ```bash
   npm run compile
   npm test
   ```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

#### 🐛 Bug Reports

Found a bug? Please report it!

**Before reporting:**
- Check existing issues to avoid duplicates
- Try to reproduce the bug
- Gather relevant information (error messages, steps to reproduce)

**Create an issue with:**
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Screenshots if applicable

#### 💡 Feature Requests

Have an idea for improvement?

**Create an issue describing:**
- The problem you're trying to solve
- Your proposed solution
- Alternative solutions considered
- Additional context

#### 📖 Documentation Improvements

Documentation can always be better!

**You can help by:**
- Fixing typos or grammar
- Clarifying confusing sections
- Adding missing information
- Creating tutorials or examples

#### 🔨 Code Contributions

Want to add features or fix bugs?

**Follow the workflow below** ⬇️

## Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Your Changes

#### For New FHEVM Examples

1. **Create the contract** in `contracts/`:
   ```solidity
   // contracts/YourExample.sol
   // SPDX-License-Identifier: BSD-3-Clause-Clear
   pragma solidity ^0.8.24;

   import { FHE, euint8 } from "@fhevm/solidity/lib/FHE.sol";
   import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

   /// @title Your Example Contract
   /// @notice Brief description
   contract YourExample is ZamaEthereumConfig {
       // Implementation with detailed comments
   }
   ```

2. **Create tests** in `test/`:
   ```javascript
   /**
    * @fileoverview YourExample test suite
    * @category your-category
    */

   describe("YourExample", function () {
       // Comprehensive tests
   });
   ```

3. **Update automation scripts**:
   - Add to `automation/create-fhevm-example.js`
   - Add to `automation/generate-docs.js`

4. **Update catalog**:
   - Add entry to `EXAMPLES_CATALOG.md`

#### For Bug Fixes

1. **Write a failing test** that reproduces the bug
2. **Fix the bug** in the code
3. **Verify the test passes**
4. **Check for side effects** - run all tests

#### For Documentation

1. **Edit the relevant .md files**
2. **Check markdown formatting**
3. **Verify links work**
4. **Regenerate docs if needed**: `npm run generate-docs`

### 3. Test Your Changes

Run the full test suite:

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Check coverage
npm run coverage

# Lint Solidity
npm run lint:sol

# Format code
npm run format

# Full verification
npm run verify
```

All tests must pass before submitting!

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add new example for encrypted voting"
```

**Commit message format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(contracts): add blind auction example"
git commit -m "fix(tests): correct access control test assertions"
git commit -m "docs: update DEVELOPER_GUIDE with new patterns"
git commit -m "test: add edge cases for medical review"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. **Go to GitHub** and navigate to your fork
2. **Click "New Pull Request"**
3. **Select your branch**
4. **Fill out the PR template**:
   - Clear title
   - Description of changes
   - Related issues (if any)
   - Checklist completion
5. **Submit the PR**

## Code Standards

### Solidity Standards

**Style Guide:**
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use 4 spaces for indentation
- Maximum line length: 120 characters
- Use descriptive variable names

**Documentation:**
```solidity
/// @title Contract Title
/// @notice What the contract does
/// @dev Implementation details
contract Example {
    /// @notice What this function does
    /// @param param1 Parameter description
    /// @return Return value description
    function exampleFunction(uint256 param1) external returns (bool) {
        // Implementation
    }
}
```

**FHEVM Best Practices:**
```solidity
// ✅ ALWAYS grant permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, user);

// ✅ ALWAYS validate inputs
require(plainValue >= 1 && plainValue <= 5, "Invalid range");

// ✅ ALWAYS document FHE operations
// Encrypt the rating value for privacy preservation
euint8 encrypted = FHE.asEuint8(rating);
```

### JavaScript/TypeScript Standards

**Style Guide:**
- Use 2 spaces for indentation
- Use semicolons
- Use async/await over promises
- Use descriptive variable names

**Test Structure:**
```javascript
describe("Contract Name", function () {
  beforeEach(async function () {
    // Setup
  });

  describe("Function Group", function () {
    /**
     * Test: Clear test description
     * Demonstrates: What FHEVM concept
     */
    it("should do something specific", async function () {
      // Arrange
      const input = 42;

      // Act
      const result = await contract.function(input);

      // Assert
      expect(result).to.equal(expected);
    });
  });
});
```

### Code Quality

**All code must:**
- Compile without errors
- Pass all tests
- Have 80%+ test coverage
- Pass linting checks
- Be formatted consistently
- Include documentation

**Run quality checks:**
```bash
npm run verify
```

## Testing Guidelines

### Test Coverage Requirements

- **Contracts**: 80%+ coverage required
- **Critical functions**: 100% coverage
- **Edge cases**: Must be tested
- **Error conditions**: Must be tested

### Test Categories

Every major contract should have tests for:

1. **Setup and Initialization**
   ```javascript
   it("should deploy with correct initial state", async function () {
     // Test deployment
   });
   ```

2. **Core Functionality**
   ```javascript
   it("should perform main operation correctly", async function () {
     // Test main features
   });
   ```

3. **Access Control**
   ```javascript
   it("should restrict access to authorized users", async function () {
     // Test permissions
   });
   ```

4. **Edge Cases**
   ```javascript
   it("should handle boundary conditions", async function () {
     // Test min/max values
   });
   ```

5. **Error Conditions**
   ```javascript
   it("should revert on invalid input", async function () {
     await expect(contract.function(invalid)).to.be.revertedWith("Error message");
   });
   ```

6. **FHE Specific**
   ```javascript
   it("should properly set FHE permissions", async function () {
     // Test FHE.allowThis and FHE.allow
   });
   ```

### Testing FHEVM Contracts

**Important patterns:**

```javascript
// Initialize FHEVM instance
const { FhevmInstance } = require("@zama-ai/fhevm-core");
const fhevm = await FhevmInstance.getInstance();

// Create encrypted input
const encryptedInput = await fhevm.createEncryptedInput(
  await contract.getAddress(),
  signer.address
);

// Test decryption
const result = await fhevm.decrypt(contract.getAddress(), encrypted);
```

## Documentation

### What to Document

**In Code:**
- Purpose of contracts and functions
- Parameters and return values
- Complex logic explanations
- FHEVM concept explanations
- Security considerations

**In Markdown:**
- How to use features
- Examples and tutorials
- API references
- Troubleshooting guides

### Documentation Standards

**Use clear headings:**
```markdown
# Main Title
## Section Title
### Subsection Title
```

**Use code blocks:**
````markdown
```solidity
// Your code here
```
````

**Use examples:**
```markdown
**Example:**
```bash
npm run test
```
```

**Link to related docs:**
```markdown
See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for details.
```

## Pull Request Process

### PR Checklist

Before submitting, ensure:

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Test coverage meets requirements (80%+)
- [ ] Code is formatted (`npm run format`)
- [ ] Linting passes (`npm run lint:sol`)
- [ ] Documentation is updated
- [ ] EXAMPLES_CATALOG.md updated (if adding example)
- [ ] Commit messages follow convention
- [ ] No merge conflicts with main branch

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Coverage increased/maintained

## Related Issues
Closes #123

## Screenshots (if applicable)

## Additional Notes
```

### Review Process

1. **Automated checks** run (CI/CD)
2. **Maintainer review** (1-2 reviewers)
3. **Feedback** may be provided
4. **Address feedback** by pushing new commits
5. **Approval** from maintainer(s)
6. **Merge** into main branch

**Timeline:**
- Initial review: Within 3-5 days
- Follow-up reviews: 1-2 days

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Zama Discord**: https://discord.gg/zama
- **Zama Forum**: https://www.zama.ai/community

### Getting Help

**For development questions:**
1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Join Discord #dev-help channel

**For FHEVM questions:**
1. Review [FHEVM Documentation](https://docs.zama.ai/fhevm)
2. Check [Zama Forum](https://www.zama.ai/community)
3. Ask in Discord #fhevm channel

## Recognition

Contributors will be:
- Listed in project contributors
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to FHEVM examples! 🎉

---

**Questions?** Open an issue or join our [Discord](https://discord.gg/zama)
