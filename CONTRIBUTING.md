# Contributing to Private Fertility Records

Thank you for your interest in contributing to this FHEVM example project! This document provides guidelines for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Guidelines](#documentation-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. **Check existing issues** to avoid duplicates
2. **Test on the latest version**
3. **Verify it's reproducible**

When reporting:
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [e.g., macOS 13.0]
- Node: [e.g., 18.16.0]
- Hardhat: [e.g., 2.19.0]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

1. **Use case**: Why is this enhancement useful?
2. **Proposed solution**: How should it work?
3. **Alternatives**: What other approaches did you consider?
4. **Additional context**: Mockups, examples, etc.

### Contributing Code

Areas where contributions are welcome:

1. **New FHEVM Patterns**
   - Encrypted computations
   - Advanced access control
   - Privacy-preserving analytics

2. **Test Coverage**
   - Edge cases
   - Integration tests
   - Performance benchmarks

3. **Documentation**
   - Code comments
   - Usage examples
   - Tutorial content

4. **Frontend Improvements**
   - UI/UX enhancements
   - Additional features
   - Mobile responsiveness

---

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- Git
- A GitHub account

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/ConfidentialFertilityRecords.git
cd ConfidentialFertilityRecords

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/ConfidentialFertilityRecords.git

# 4. Install dependencies
npm install

# 5. Create a branch
git checkout -b feature/your-feature-name

# 6. Make your changes

# 7. Run tests
npm test

# 8. Commit and push
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name

# 9. Open a pull request on GitHub
```

---

## Coding Standards

### Solidity Code

#### Style Guide

Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html):

```solidity
// ✅ Good
contract MyContract {
    uint256 public myVariable;

    function myFunction(uint256 _param) external returns (uint256) {
        require(_param > 0, "Invalid parameter");
        return _param * 2;
    }
}

// ❌ Bad
contract myContract {
    uint256 public MyVariable;

    function MyFunction(uint256 param) external returns(uint256){
        require(param>0);
        return param*2;
    }
}
```

#### Naming Conventions

- **Contracts**: PascalCase (`ConfidentialFertilityRecords`)
- **Functions**: camelCase (`createRecord`)
- **Variables**: camelCase (`totalRecords`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RECORDS`)
- **Private vars**: underscore prefix (`_internalValue`)
- **Parameters**: underscore prefix (`_age`)

#### Comments

Use NatSpec for all public functions:

```solidity
/**
 * @notice Creates a new encrypted fertility record
 * @dev Only authorized doctors can create records
 * @param _age Patient's age (must be 18-100)
 * @param _pregnancyCount Number of previous pregnancies
 * @return recordId The ID of the created record
 */
function createRecord(
    uint8 _age,
    uint8 _pregnancyCount
) external returns (uint256 recordId) {
    // Implementation
}
```

### TypeScript Code

#### Style Guide

```typescript
// ✅ Good
async function deployContract(): Promise<Contract> {
    const Factory = await ethers.getContractFactory("MyContract");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return contract;
}

// ❌ Bad
async function deploy_contract() {
    let factory = await ethers.getContractFactory("MyContract")
    let contract = await factory.deploy()
    return contract
}
```

#### Use TypeScript Features

```typescript
// ✅ Good: Proper typing
interface RecordData {
    age: number;
    pregnancyCount: number;
}

async function createRecord(data: RecordData): Promise<void> {
    // Implementation
}

// ❌ Bad: Any types
async function createRecord(data: any) {
    // Implementation
}
```

### General Principles

1. **DRY (Don't Repeat Yourself)**
   - Extract common logic into functions
   - Use inheritance for shared contract code

2. **KISS (Keep It Simple, Stupid)**
   - Prefer simple, readable code
   - Avoid clever tricks

3. **Security First**
   - Always validate inputs
   - Check for reentrancy
   - Use SafeMath when needed

4. **Gas Efficiency**
   - Minimize storage operations
   - Batch operations when possible
   - Use appropriate data types

---

## Testing Requirements

### Test Coverage

All contributions must include tests:

- **New features**: Add tests covering all functionality
- **Bug fixes**: Add regression tests
- **Target coverage**: Aim for 80%+ coverage

### Test Structure

```typescript
/**
 * @title Feature Name Tests
 * @description What this test suite covers
 * @chapter access-control
 */
describe("Feature Name", function () {
    beforeEach(async function () {
        // Setup
    });

    describe("Specific Functionality", function () {
        /**
         * @test Should do something specific
         * @description Detailed explanation
         */
        it("Should do something specific", async function () {
            // Arrange
            const input = 42;

            // Act
            const result = await contract.someFunction(input);

            // Assert
            expect(result).to.equal(expectedValue);
        });
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/MyTest.test.ts

# Run with coverage
npm run test:coverage

# Run with gas reporting
REPORT_GAS=true npm test
```

### Test Requirements

- ✅ All tests must pass
- ✅ No test should be skipped (.skip)
- ✅ Include both positive and negative test cases
- ✅ Test edge cases and boundary conditions
- ✅ Use descriptive test names

---

## Documentation Guidelines

### Code Comments

#### When to Comment

**DO comment:**
- Complex logic or algorithms
- Non-obvious design decisions
- Security considerations
- Gas optimization techniques

**DON'T comment:**
- Obvious code (`i++; // increment i`)
- Redundant descriptions

#### JSDoc/TSDoc Annotations

For test files, use annotations for documentation generation:

```typescript
/**
 * @test Test description
 * @description Detailed explanation of what this tests
 * @chapter access-control
 * @category healthcare
 *
 * **FHEVM Concept:** What FHEVM pattern this demonstrates
 * - Additional context
 * - Key learnings
 */
it("Should demonstrate pattern", async function () {
    // Test implementation
});
```

### README Updates

When adding features:
1. Update the main README.md
2. Add usage examples
3. Update feature list
4. Document any breaking changes

### Architecture Documentation

For significant changes:
1. Update ARCHITECTURE.md
2. Include diagrams if helpful
3. Explain design decisions
4. Document trade-offs

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commits are descriptive and atomic
- [ ] No console.log or debugging code
- [ ] No commented-out code

### PR Description Template

```markdown
## Description
Brief description of changes

## Motivation and Context
Why is this change needed? What problem does it solve?

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe tests performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Automated Checks**: CI/CD runs tests automatically
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Squash and merge into main branch

### Commit Message Format

```
type(scope): short description

Longer description if needed

BREAKING CHANGE: description of breaking change (if applicable)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

**Examples:**
```
feat(contract): add encrypted comparison function

fix(tests): correct access control test expectations

docs(readme): update deployment instructions
```

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions

### Getting Help

If you need help:
1. Check existing documentation (README, ARCHITECTURE, SETUP)
2. Search existing issues
3. Ask in GitHub Discussions
4. Create a new issue if needed

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (coming soon)
- Mentioned in release notes
- Credited in project documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the FHEVM community! 🙏
