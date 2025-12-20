#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * @fileoverview FHEVM Example Scaffolding Tool
 *
 * Creates standalone FHEVM example repositories with:
 * - Hardhat configuration
 * - Contract templates
 * - Test suites with TSDoc
 * - Documentation generation
 * - Deployment scripts
 *
 * Usage: node automation/create-fhevm-example.js <example-name> <category>
 * Example: node automation/create-fhevm-example.js medical-review access-control
 *
 * @category automation
 * @category scaffolding
 */

class FHEVMExampleGenerator {
  constructor(exampleName, category) {
    this.exampleName = exampleName;
    this.category = category || 'general';
    this.targetDir = path.join(process.cwd(), '..', `fhevm-${exampleName}-example`);
    this.templateDir = process.cwd();
  }

  /**
   * Main generator entry point
   * Orchestrates the entire scaffolding process
   */
  async generate() {
    console.log(`🚀 Generating FHEVM Example: ${this.exampleName}`);
    console.log(`📂 Target directory: ${this.targetDir}`);
    console.log(`🏷️  Category: ${this.category}\n`);

    try {
      this.createDirectoryStructure();
      this.copyConfigFiles();
      this.generatePackageJson();
      this.copyContracts();
      this.copyTests();
      this.copyScripts();
      this.generateReadme();
      this.generateGitignore();
      this.generateEnvTemplate();
      this.installDependencies();

      console.log('\n✅ FHEVM Example generated successfully!');
      console.log(`\n📝 Next steps:`);
      console.log(`   cd ${path.basename(this.targetDir)}`);
      console.log(`   npm install`);
      console.log(`   npm test`);
      console.log(`   npm run compile`);
      console.log(`   npm run deploy:local\n`);
    } catch (error) {
      console.error('❌ Error generating example:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create the basic directory structure
   */
  createDirectoryStructure() {
    console.log('📁 Creating directory structure...');

    const dirs = [
      this.targetDir,
      path.join(this.targetDir, 'contracts'),
      path.join(this.targetDir, 'test'),
      path.join(this.targetDir, 'scripts'),
      path.join(this.targetDir, 'automation'),
      path.join(this.targetDir, 'docs')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Copy Hardhat configuration files
   */
  copyConfigFiles() {
    console.log('⚙️  Copying configuration files...');

    const configFiles = [
      'hardhat.config.js',
      '.prettierrc',
      '.solhintrc.json'
    ];

    configFiles.forEach(file => {
      const sourcePath = path.join(this.templateDir, file);
      const targetPath = path.join(this.targetDir, file);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  /**
   * Generate customized package.json
   */
  generatePackageJson() {
    console.log('📦 Generating package.json...');

    const packageJson = {
      name: `fhevm-${this.exampleName}-example`,
      version: '1.0.0',
      description: `FHEVM Example: ${this.formatName(this.exampleName)} - Demonstrates ${this.category} patterns`,
      main: 'index.js',
      scripts: {
        compile: 'npx hardhat compile',
        test: 'npx hardhat test',
        'test:verbose': 'npx hardhat test --verbose',
        'test:gas': 'REPORT_GAS=true npx hardhat test',
        deploy: 'npx hardhat run scripts/deploy.js --network sepolia',
        'deploy:local': 'npx hardhat run scripts/deploy.js --network localhost',
        node: 'npx hardhat node',
        'generate-docs': 'node automation/generate-docs.js'
      },
      dependencies: {
        dotenv: '^16.3.1',
        ethers: '^6.7.1',
        '@fhevm/solidity': '^0.4.0'
      },
      devDependencies: {
        '@nomicfoundation/hardhat-toolbox': '^3.0.2',
        '@types/node': '^20.0.0',
        hardhat: '^2.17.1',
        chai: '^4.3.7'
      },
      keywords: [
        'fhevm',
        'fhe',
        'fully-homomorphic-encryption',
        'zama',
        this.category,
        this.exampleName,
        'privacy-preserving',
        'bounty-submission'
      ],
      author: 'FHEVM Example Contributor',
      license: 'MIT',
      engines: {
        node: '>=18.0.0',
        npm: '>=9.0.0'
      }
    };

    fs.writeFileSync(
      path.join(this.targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Copy contract files to new example
   */
  copyContracts() {
    console.log('📄 Copying contract files...');

    const contractsDir = path.join(this.templateDir, 'contracts');
    const targetContractsDir = path.join(this.targetDir, 'contracts');

    if (fs.existsSync(contractsDir)) {
      const files = fs.readdirSync(contractsDir);
      files.forEach(file => {
        if (file.endsWith('.sol')) {
          const sourcePath = path.join(contractsDir, file);
          const targetPath = path.join(targetContractsDir, file);
          fs.copyFileSync(sourcePath, targetPath);
        }
      });
    }
  }

  /**
   * Copy test files to new example
   */
  copyTests() {
    console.log('🧪 Copying test files...');

    const testsDir = path.join(this.templateDir, 'test');
    const targetTestsDir = path.join(this.targetDir, 'test');

    if (fs.existsSync(testsDir)) {
      const files = fs.readdirSync(testsDir);
      files.forEach(file => {
        const sourcePath = path.join(testsDir, file);
        const targetPath = path.join(targetTestsDir, file);
        fs.copyFileSync(sourcePath, targetPath);
      });
    }
  }

  /**
   * Copy script files to new example
   */
  copyScripts() {
    console.log('📜 Copying deployment scripts...');

    const scriptsDir = path.join(this.templateDir, 'scripts');
    const targetScriptsDir = path.join(this.targetDir, 'scripts');

    if (fs.existsSync(scriptsDir)) {
      const files = fs.readdirSync(scriptsDir);
      files.forEach(file => {
        const sourcePath = path.join(scriptsDir, file);
        const targetPath = path.join(targetScriptsDir, file);
        fs.copyFileSync(sourcePath, targetPath);
      });
    }

    // Copy automation scripts
    const autoFiles = ['generate-docs.js'];
    autoFiles.forEach(file => {
      const sourcePath = path.join(this.templateDir, 'automation', file);
      const targetPath = path.join(this.targetDir, 'automation', file);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  /**
   * Generate README.md with example-specific content
   */
  generateReadme() {
    console.log('📖 Generating README...');

    const readmeContent = `# FHEVM Example: ${this.formatName(this.exampleName)}

> **Category:** ${this.category}
> **Zama Bounty:** December 2025 - FHEVM Example Hub

## Overview

This example demonstrates privacy-preserving smart contracts using Fully Homomorphic Encryption (FHE) on the FHEVM.

### Key Concepts Demonstrated

- **Access Control**: FHE.allow and FHE.allowThis patterns
- **Encrypted Operations**: Working with encrypted values (euint8, euint16, etc.)
- **Public Decryption**: Decryption workflow using FHE.requestDecryption
- **Privacy Preservation**: Maintaining data confidentiality on-chain

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

\`\`\`bash
npm install
\`\`\`

### Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

### Run Tests

\`\`\`bash
npm test
\`\`\`

For verbose output with gas reporting:

\`\`\`bash
npm run test:gas
\`\`\`

### Local Deployment

Start a local Hardhat node:

\`\`\`bash
npm run node
\`\`\`

In another terminal, deploy the contract:

\`\`\`bash
npm run deploy:local
\`\`\`

## Project Structure

\`\`\`
${this.exampleName}-example/
├── contracts/          # Solidity contracts
├── test/              # Test suites with TSDoc
├── scripts/           # Deployment scripts
├── automation/        # Documentation generation
├── docs/             # Generated documentation
├── hardhat.config.js # Hardhat configuration
└── package.json      # Project dependencies
\`\`\`

## Key Features

### Access Control Pattern

This example demonstrates proper FHE access control:

\`\`\`solidity
// Allow the contract to access encrypted values
FHE.allowThis(encryptedValue);

// Allow specific addresses to decrypt
FHE.allow(encryptedValue, userAddress);
\`\`\`

### Encrypted Operations

Working with encrypted values:

\`\`\`solidity
euint8 encryptedValue = FHE.asEuint8(plainValue);
euint8 sum = FHE.add(value1, value2);
ebool isEqual = FHE.eq(value1, value2);
\`\`\`

### Public Decryption Workflow

Requesting decryption of encrypted values:

\`\`\`solidity
FHE.requestDecryption(
    ciphertexts,
    callbackSelector
);
\`\`\`

## Testing

Tests are documented with TSDoc comments explaining each concept:

\`\`\`bash
npm test              # Run all tests
npm run test:verbose  # Verbose output
npm run test:gas      # Include gas reporting
\`\`\`

## Documentation

Generate documentation from code comments:

\`\`\`bash
npm run generate-docs
\`\`\`

Documentation will be created in the \`docs/\` directory in GitBook-compatible format.

## Network Deployment

### Testnet Deployment (Sepolia)

1. Create a \`.env\` file from \`.env.template\`:

\`\`\`bash
cp .env.template .env
\`\`\`

2. Add your credentials:

\`\`\`
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_key_here
\`\`\`

3. Deploy:

\`\`\`bash
npm run deploy
\`\`\`

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [Bounty Details](https://github.com/zama-ai/bounty-program)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

**Generated with:** FHEVM Example Scaffolding Tool
**Bounty:** Zama December 2025 - Build FHEVM Example Hub
`;

    fs.writeFileSync(
      path.join(this.targetDir, 'README.md'),
      readmeContent
    );
  }

  /**
   * Generate .gitignore file
   */
  generateGitignore() {
    console.log('🔒 Generating .gitignore...');

    const gitignoreContent = `# Dependencies
node_modules/

# Hardhat
cache/
artifacts/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Deployment
deployment-info.json

# Coverage
coverage/
coverage.json

# TypeScript
*.tsbuildinfo
`;

    fs.writeFileSync(
      path.join(this.targetDir, '.gitignore'),
      gitignoreContent
    );
  }

  /**
   * Generate .env.template file
   */
  generateEnvTemplate() {
    console.log('🔐 Generating .env.template...');

    const envTemplate = `# Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Infura API Key for Sepolia network
INFURA_API_KEY=your_infura_api_key_here

# Optional: Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
`;

    fs.writeFileSync(
      path.join(this.targetDir, '.env.template'),
      envTemplate
    );
  }

  /**
   * Install dependencies in the new project
   */
  installDependencies() {
    console.log('📥 Installing dependencies...');
    console.log('   (This may take a few minutes)\n');

    try {
      execSync('npm install', {
        cwd: this.targetDir,
        stdio: 'inherit'
      });
    } catch (error) {
      console.warn('⚠️  Manual installation required. Run: cd', path.basename(this.targetDir), '&& npm install');
    }
  }

  /**
   * Format example name for display
   */
  formatName(name) {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// CLI Entry Point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('❌ Usage: node create-fhevm-example.js <example-name> [category]');
    console.error('   Example: node create-fhevm-example.js medical-review access-control');
    process.exit(1);
  }

  const [exampleName, category] = args;
  const generator = new FHEVMExampleGenerator(exampleName, category);
  generator.generate();
}

module.exports = FHEVMExampleGenerator;
