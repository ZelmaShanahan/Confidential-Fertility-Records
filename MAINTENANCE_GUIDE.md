# Maintenance Guide

This guide explains how to maintain the FHEVM example project and update it when dependencies change.

## Maintenance Overview

The project consists of:
1. **Base Template** - Hardhat configuration and structure
2. **Smart Contracts** - Solidity implementations
3. **Tests** - Hardhat test suite
4. **Automation Scripts** - Scaffolding and documentation tools
5. **Documentation** - Auto-generated GitBook content

When dependencies update, each component may need maintenance.

## Dependency Update Process

### Step 1: Monitor Releases

Keep track of updates to:
- `@fhevm/solidity` - Core FHE library
- `@fhevm/hardhat-plugin` - Testing utilities
- `hardhat` - Development environment
- `ethers` - Web3 library

Subscribe to:
- [FHEVM GitHub Releases](https://github.com/zama-ai/fhevm)
- [Hardhat Releases](https://github.com/NomicFoundation/hardhat)
- [Ethers Releases](https://github.com/ethers-io/ethers.js)

### Step 2: Review Breaking Changes

When a new version is released:

1. **Read Release Notes**
   - What changed?
   - Are there breaking changes?
   - Migration guides provided?

2. **Check Compatibility**
   - Will existing code still work?
   - Do contracts need updates?
   - Do tests need updates?

3. **Plan Update**
   - Will we update immediately or wait?
   - Do we need to maintain multiple versions?
   - What examples are affected?

### Step 3: Test in Isolation

Before updating the main project:

```bash
# Create temporary directory for testing
mkdir /tmp/fhevm-update-test
cd /tmp/fhevm-update-test

# Copy current working example
cp -r ../fhevm-anonymous-medical-review .
cd fhevm-anonymous-medical-review

# Update dependencies
npm install @fhevm/solidity@latest

# Test compilation
npm run compile

# Run tests
npm test

# If successful, tests pass. If not, note what broke.
```

### Step 4: Update Base Template

If all tests pass with the new version:

```bash
# Update package.json in main project
npm install @fhevm/solidity@latest

# Verify compilation
npm run compile

# Run full test suite
npm run test

# Check coverage still meets requirements
npm run coverage

# Commit changes
git add package.json package-lock.json
git commit -m "Update @fhevm/solidity to latest version"
```

### Step 5: Update All Examples

After base template is updated:

```bash
# Test scaffolding tool with new version
npm run scaffold test-example general
cd ../fhevm-test-example-example
npm install
npm run compile
npm test

# If successful, update any other examples
# If issues arise, fix in base template and regenerate
```

### Step 6: Update Automation Scripts

If API changes require automation script updates:

1. **Edit create-fhevm-example.js**
   - Update version pins if needed
   - Adjust generated files if format changed
   - Test with new version

2. **Edit generate-docs.js**
   - Update documentation patterns if needed
   - Test documentation generation
   - Verify output format

3. **Test Both Tools**
   ```bash
   npm run scaffold my-example general
   npm run generate-docs
   ```

### Step 7: Update Documentation

When dependencies update:

1. **Regenerate Documentation**
   ```bash
   npm run generate-docs
   ```

2. **Update DEVELOPER_GUIDE.md**
   - Note new features
   - Update code examples
   - Add new patterns if applicable

3. **Update BASE_TEMPLATE_GUIDE.md**
   - Version information
   - Configuration changes
   - New capabilities

4. **Commit Changes**
   ```bash
   git add docs/ DEVELOPER_GUIDE.md BASE_TEMPLATE_GUIDE.md
   git commit -m "Update documentation for new dependency versions"
   ```

## Breaking Changes Handling

### Scenario: FHEVM Solidity API Changes

**Example**: `FHE.requestDecryption` signature changed

**Steps**:

1. **Identify Affected Contracts**
   ```bash
   grep -r "FHE.requestDecryption" contracts/
   ```

2. **Update Contract Signature**
   ```solidity
   // Old way
   FHE.requestDecryption(ciphertexts, this.callback.selector);

   // New way (hypothetical)
   FHE.requestDecryption(ciphertexts, callbackAddress, callbackSelector);
   ```

3. **Update All Tests**
   - Find tests using old API
   - Update test calls
   - Verify tests still pass

4. **Update Automation Scripts**
   - Update generated contract templates
   - Ensure scaffolded examples use new API

5. **Update Documentation**
   - Document the change
   - Provide migration guide
   - Update examples

### Scenario: Test Framework Changes

**Example**: Hardhat changes assertion library

**Steps**:

1. **Check What's Different**
   ```bash
   npm test  # Run to see errors
   ```

2. **Update Test Files**
   - Replace old assertions with new ones
   - Verify all tests pass

3. **Update Test Templates**
   - Update test generation in automation scripts
   - Ensure new tests use correct assertions

4. **Verify Scaffolding**
   ```bash
   npm run scaffold test-upgrade general
   cd fhevm-test-upgrade-example && npm test
   ```

## Version Management

### Pinning Strategy

In `package.json`, use caret (^) for most dependencies:

```json
{
  "dependencies": {
    "@fhevm/solidity": "^0.9.1",     // Allows 0.9.x
    "ethers": "^6.7.1",              // Allows 6.x
    "hardhat": "^2.22.0"             // Allows 2.x
  }
}
```

**But pin exactly for critical tools**:

```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "5.0.0"  // Exact version
  }
}
```

### Maintenance Schedule

- **Check Weekly**: Look for security updates
- **Check Monthly**: Look for feature updates
- **Plan Quarterly**: Schedule major version updates
- **Test Immediately**: New FHEVM releases (likely breaking)

## Common Maintenance Tasks

### Task: Update All Dependencies

```bash
# Update everything to latest compatible
npm update

# Check what would be updated
npm outdated

# Update specific package
npm install package-name@latest
```

### Task: Fix Security Vulnerability

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Fix specific package
npm install vulnerable-package@latest
```

### Task: Add New FHEVM Feature

If FHEVM adds a new feature you want to demonstrate:

1. **Create Example Contract**
   ```solidity
   // contracts/NewFeatureExample.sol
   import { FHE, newFeature } from "@fhevm/solidity/lib/FHE.sol";

   contract NewFeatureExample {
       function demonstrateNewFeature() external {
           // Use new feature here
       }
   }
   ```

2. **Create Corresponding Test**
   ```javascript
   // test/NewFeatureExample.test.js
   describe("NewFeatureExample", function () {
       it("should use new feature", async function () {
           // Test new feature
       });
   });
   ```

3. **Update Automation Scripts**
   - Add new example to config
   - Update scaffolding tool if needed

4. **Generate and Test**
   ```bash
   npm run scaffold new-feature-example "new-features"
   npm run generate-docs
   ```

### Task: Refactor for Performance

If profiling shows performance issues:

1. **Identify Bottleneck**
   ```bash
   npm run test:gas
   # Look for unexpectedly high gas usage
   ```

2. **Optimize Contract**
   - Reduce state changes
   - Optimize calculations
   - Use cheaper operations

3. **Verify Performance Improves**
   ```bash
   npm run test:gas
   ```

4. **Update Tests if Needed**
   - Add gas assertion if appropriate
   - Document optimization

### Task: Update Code Style

If project adopts new code standards:

1. **Configure Tools**
   - Update `.prettierrc`
   - Update `.solhintrc.json`

2. **Auto-format Code**
   ```bash
   npm run format
   ```

3. **Fix Linting Issues**
   ```bash
   npm run lint:sol
   ```

4. **Test Everything Still Works**
   ```bash
   npm run verify
   ```

## Testing Checklist

For any maintenance task, verify:

- [ ] **Compilation**: `npm run compile` (no errors)
- [ ] **Tests Pass**: `npm test` (all pass)
- [ ] **Coverage**: `npm run coverage` (≥80%)
- [ ] **Gas**: `npm run test:gas` (no unexpected increases)
- [ ] **Scaffolding**: `npm run scaffold test general` works
- [ ] **Documentation**: `npm run generate-docs` works
- [ ] **Linting**: `npm run lint:sol` (no warnings)
- [ ] **Formatting**: `npm run format` (no changes needed)

## Emergency Maintenance

### Issue: Critical Security Vulnerability

1. **Immediately update**
   ```bash
   npm audit
   npm audit fix --force
   ```

2. **Test thoroughly**
   ```bash
   npm test
   npm run coverage
   ```

3. **Deploy fix**
   - If already deployed, notify users
   - Provide upgrade instructions
   - Document the vulnerability and fix

### Issue: Contract Bug Found

1. **Create test for bug**
   ```javascript
   it("should handle edge case", async function () {
       // Test that reproduces bug
   });
   ```

2. **Verify test fails**
   ```bash
   npm test
   ```

3. **Fix the bug**
   - Update contract
   - Ensure test passes

4. **Add regression test**
   - Keep the test in suite
   - Prevent bug from recurring

5. **Update deployment**
   - Redeploy contract
   - Update deployment info

## Documentation Updates

When anything significant changes:

1. **Update README.md**
   - If dependencies changed significantly
   - If behavior changed
   - If new features added

2. **Update DEVELOPER_GUIDE.md**
   - If development process changed
   - If patterns changed
   - If tooling changed

3. **Regenerate auto-generated docs**
   ```bash
   npm run generate-docs
   ```

4. **Commit documentation changes**
   ```bash
   git add README.md DEVELOPER_GUIDE.md docs/
   git commit -m "Update documentation"
   ```

## Continuous Integration

For automated maintenance:

### GitHub Actions Example

```yaml
name: Dependency Updates

on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly on Monday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install
      - run: npm run compile
      - run: npm test
      - run: npm run coverage

      - uses: peter-evans/create-pull-request@v4
        with:
          commit-message: 'chore: update dependencies'
          title: 'Automated dependency update'
```

## Rollback Procedure

If update breaks things:

```bash
# Check git history
git log --oneline

# Revert to previous version
git revert <commit-hash>

# Or reset to before update
git reset --hard <previous-commit>

# Verify it works
npm test

# Identify what broke
# Fix in isolated environment
# Test again
# Commit fix
```

## Long-term Maintenance

### Quarterly Review

```bash
# Check everything
npm install
npm run clean
npm run compile
npm test
npm run coverage
npm run lint:sol
npm run format
npm run generate-docs

# Any issues? Fix them.
# All green? Commit.
git commit -am "Maintenance: verify all systems functional"
```

### Annual Refresh

Once per year:
1. Update all dependencies
2. Review and refactor contracts
3. Update documentation
4. Test all examples
5. Release new version

## Contact & Support

For maintenance questions:

- **Zama Discord**: https://discord.gg/zama
- **Zama Forum**: https://www.zama.ai/community
- **GitHub Issues**: Open issue in project repo

---

**Last Updated**: December 2025
**Maintainer**: FHEVM Community
