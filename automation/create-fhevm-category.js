#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * @fileoverview FHEVM Category Project Generator
 *
 * Generates a project containing multiple FHEVM examples from a specific category.
 * This is useful for learning several related concepts together.
 *
 * Usage: node automation/create-fhevm-category.js <category> [output-dir]
 * Example: node automation/create-fhevm-category.js access-control ../my-examples
 *
 * @category automation
 * @category scaffolding
 */

/**
 * Category definitions with their included examples
 */
const CATEGORIES = {
  'access-control': {
    name: 'Access Control Examples',
    description: 'Comprehensive examples demonstrating FHE permission management',
    examples: ['medical-review'],
    contracts: ['AnonymousMedicalReview.sol'],
    tests: ['MedicalReview.test.js']
  },
  'basic': {
    name: 'Basic FHEVM Operations',
    description: 'Introduction to FHE encryption, decryption, and arithmetic',
    examples: ['fhe-counter', 'fhe-arithmetic', 'fhe-comparison'],
    contracts: [],
    tests: []
  },
  'encryption': {
    name: 'Encryption Patterns',
    description: 'Examples showing various encryption patterns and best practices',
    examples: ['single-value-encryption', 'multiple-value-encryption'],
    contracts: [],
    tests: []
  },
  'decryption': {
    name: 'Decryption Workflows',
    description: 'User and public decryption patterns',
    examples: ['user-decrypt', 'public-decrypt'],
    contracts: [],
    tests: []
  },
  'advanced': {
    name: 'Advanced FHEVM Patterns',
    description: 'Complex use cases and production patterns',
    examples: ['blind-auction', 'private-voting', 'medical-review'],
    contracts: [],
    tests: []
  },
  'tokens': {
    name: 'OpenZeppelin Confidential Tokens',
    description: 'ERC7984 and confidential token examples',
    examples: ['erc7984-token', 'token-swap'],
    contracts: [],
    tests: []
  }
};

class CategoryProjectGenerator {
  constructor(category, outputDir) {
    this.category = category;
    this.categoryConfig = CATEGORIES[category];
    this.outputDir = outputDir || path.join(process.cwd(), '..', `fhevm-${category}-examples`);
    this.templateDir = process.cwd();

    if (!this.categoryConfig) {
      throw new Error(`Unknown category: ${category}. Available: ${Object.keys(CATEGORIES).join(', ')}`);
    }
  }

  /**
   * Main generator entry point
   */
  async generate() {
    console.log(`🚀 Generating FHEVM Category Project: ${this.categoryConfig.name}`);
    console.log(`📂 Output directory: ${this.outputDir}`);
    console.log(`📦 Including examples: ${this.categoryConfig.examples.join(', ')}\n`);

    try {
      this.createDirectoryStructure();
      this.copyConfigFiles();
      this.generatePackageJson();
      this.copyAllContracts();
      this.copyAllTests();
      this.generateDeployScript();
      this.generateReadme();
      this.generateGitignore();
      this.generateEnvTemplate();
      this.copyAutomationScripts();
      this.installDependencies();

      console.log('\n✅ Category project generated successfully!');
      console.log(`\n📝 Next steps:`);
      console.log(`   cd ${path.basename(this.outputDir)}`);
      console.log(`   npm install`);
      console.log(`   npm test`);
      console.log(`   npm run compile\n`);
    } catch (error) {
      console.error('❌ Error generating category project:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create the basic directory structure
   */
  createDirectoryStructure() {
    console.log('📁 Creating directory structure...');

    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'contracts'),
      path.join(this.outputDir, 'test'),
      path.join(this.outputDir, 'scripts'),
      path.join(this.outputDir, 'automation'),
      path.join(this.outputDir, 'docs')
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
      '.solhintrc.json',
      '.editorconfig'
    ];

    configFiles.forEach(file => {
      const sourcePath = path.join(this.templateDir, file);
      const targetPath = path.join(this.outputDir, file);

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
      name: `fhevm-${this.category}-examples`,
      version: '1.0.0',
      description: `${this.categoryConfig.description}`,
      main: 'index.js',
      scripts: {
        compile: 'npx hardhat compile',
        test: 'npx hardhat test',
        'test:verbose': 'npx hardhat test --verbose',
        'test:gas': 'REPORT_GAS=true npx hardhat test',
        'deploy': 'npx hardhat run scripts/deploy.js --network sepolia',
        'deploy:local': 'npx hardhat run scripts/deploy.js --network localhost',
        'node': 'npx hardhat node',
        'generate-docs': 'node automation/generate-docs.js',
        'clean': 'npx hardhat clean',
        'lint:sol': 'npx solhint \'contracts/**/*.sol\'',
        'format': 'npx prettier --write \'contracts/**/*.sol\' \'test/**/*.js\' \'scripts/**/*.js\'',
        'verify': 'npm run compile && npm test && npm run coverage',
        'coverage': 'npx hardhat coverage'
      },
      dependencies: {
        dotenv: '^16.3.1',
        ethers: '^6.7.1'
      },
      devDependencies: {
        '@fhevm/solidity': '^0.9.1',
        '@nomicfoundation/hardhat-toolbox': '^5.0.0',
        '@types/node': '^20.0.0',
        hardhat: '^2.22.0',
        chai: '^4.3.7',
        typescript: '^5.0.0',
        'ts-node': '^10.9.1'
      },
      keywords: [
        'fhevm',
        'fhe',
        'fully-homomorphic-encryption',
        'zama',
        'privacy-preserving',
        this.category,
        'examples',
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
      path.join(this.outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Copy all contract files for this category
   */
  copyAllContracts() {
    console.log('📄 Copying contract files...');

    const contractsDir = path.join(this.templateDir, 'contracts');
    const targetContractsDir = path.join(this.outputDir, 'contracts');

    if (fs.existsSync(contractsDir)) {
      const files = fs.readdirSync(contractsDir);
      const contractFiles = this.categoryConfig.contracts.length > 0
        ? this.categoryConfig.contracts
        : files.filter(f => f.endsWith('.sol'));

      contractFiles.forEach(file => {
        const sourcePath = path.join(contractsDir, file);
        const targetPath = path.join(targetContractsDir, file);

        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`   ✓ Copied ${file}`);
        }
      });
    }
  }

  /**
   * Copy all test files for this category
   */
  copyAllTests() {
    console.log('🧪 Copying test files...');

    const testsDir = path.join(this.templateDir, 'test');
    const targetTestsDir = path.join(this.outputDir, 'test');

    if (fs.existsSync(testsDir)) {
      const files = fs.readdirSync(testsDir);
      const testFiles = this.categoryConfig.tests.length > 0
        ? this.categoryConfig.tests
        : files.filter(f => f.endsWith('.test.js'));

      testFiles.forEach(file => {
        const sourcePath = path.join(testsDir, file);
        const targetPath = path.join(targetTestsDir, file);

        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`   ✓ Copied ${file}`);
        }
      });
    }
  }

  /**
   * Generate unified deployment script for all contracts
   */
  generateDeployScript() {
    console.log('📜 Generating deployment script...');

    const contractNames = this.categoryConfig.contracts
      .map(file => file.replace('.sol', ''));

    const deployScript = `const hre = require("hardhat");
const fs = require("fs");

/**
 * Deployment script for ${this.categoryConfig.name}
 * Deploys all contracts in this category
 */
async function main() {
  console.log("🚀 Deploying ${this.categoryConfig.name}...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const deploymentInfo = {
    network: hre.network.name,
    deployerAddress: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

${contractNames.map(name => `
  // Deploy ${name}
  console.log("\\nDeploying ${name}...");
  const ${name} = await hre.ethers.getContractFactory("${name}");
  const ${name.toLowerCase()} = await ${name}.deploy();
  await ${name.toLowerCase()}.waitForDeployment();

  const ${name.toLowerCase()}Address = await ${name.toLowerCase()}.getAddress();
  console.log("${name} deployed to:", ${name.toLowerCase()}Address);

  deploymentInfo.contracts.${name} = {
    address: ${name.toLowerCase()}Address,
    transactionHash: ${name.toLowerCase()}.deploymentTransaction().hash
  };
`).join('')}

  // Save deployment information
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\\n✅ All contracts deployed successfully!");
  console.log("📄 Deployment info saved to deployment-info.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

    fs.writeFileSync(
      path.join(this.outputDir, 'scripts', 'deploy.js'),
      deployScript
    );
  }

  /**
   * Generate README.md with category-specific content
   */
  generateReadme() {
    console.log('📖 Generating README...');

    const readmeContent = `# ${this.categoryConfig.name}

> **Category:** ${this.category}
> **Zama Bounty:** December 2025 - FHEVM Example Hub

## Overview

${this.categoryConfig.description}

This project contains multiple FHEVM examples demonstrating related concepts in the ${this.category} category.

## Included Examples

${this.categoryConfig.examples.map((ex, idx) => `${idx + 1}. **${this.formatName(ex)}** - Demonstrates ${ex} patterns`).join('\n')}

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

In another terminal, deploy all contracts:

\`\`\`bash
npm run deploy:local
\`\`\`

## Project Structure

\`\`\`
${this.category}-examples/
├── contracts/          # All category contracts
├── test/              # All category tests
├── scripts/           # Unified deployment script
├── automation/        # Documentation generation
├── docs/             # Generated documentation
├── hardhat.config.js # Hardhat configuration
└── package.json      # Project dependencies
\`\`\`

## Key Concepts

${this.getCategoryKeyConceptsSection()}

## Testing

Tests are organized by example and include comprehensive coverage:

\`\`\`bash
npm test              # Run all tests
npm run test:verbose  # Verbose output
npm run test:gas      # Include gas reporting
npm run coverage      # Coverage report
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
- [Community Discord](https://discord.gg/zama)

## License

MIT License - see LICENSE file for details

---

**Generated with:** FHEVM Category Project Generator
**Category:** ${this.category}
**Bounty:** Zama December 2025 - Build FHEVM Example Hub
`;

    fs.writeFileSync(
      path.join(this.outputDir, 'README.md'),
      readmeContent
    );
  }

  /**
   * Get key concepts section based on category
   */
  getCategoryKeyConceptsSection() {
    const concepts = {
      'access-control': `### Access Control Patterns

- **FHE.allowThis()**: Grant contract permission to access encrypted values
- **FHE.allow()**: Grant specific addresses permission to decrypt
- **FHE.allowTransient()**: Grant temporary permissions
- **Permission Lifecycle**: Understanding when and how to set permissions`,

      'basic': `### Basic FHEVM Operations

- **Encrypted Types**: euint8, euint16, euint32, euint64
- **Arithmetic**: FHE.add, FHE.sub, FHE.mul
- **Comparison**: FHE.eq, FHE.lt, FHE.gt
- **Type Casting**: Converting between encrypted types`,

      'encryption': `### Encryption Patterns

- **Single Value Encryption**: FHE.asEuint8()
- **Multiple Value Encryption**: Batch operations
- **Input Validation**: Validating before encryption
- **Common Pitfalls**: What to avoid`,

      'decryption': `### Decryption Workflows

- **User Decryption**: Client-side decryption with permissions
- **Public Decryption**: FHE.requestDecryption()
- **Callback Handling**: Processing decrypted values
- **Proof Verification**: FHE.checkSignatures()`,

      'advanced': `### Advanced Patterns

- **Complex State Management**: Multi-value encrypted state
- **Aggregation**: Computing on encrypted values
- **Threshold Reveals**: Conditional decryption
- **Production Patterns**: Security and gas optimization`,

      'tokens': `### Confidential Token Patterns

- **ERC7984 Standard**: Confidential ERC20
- **Encrypted Balances**: Balance management
- **Private Transfers**: Transfer without revealing amounts
- **Token Bridging**: Between confidential and regular tokens`
    };

    return concepts[this.category] || '### Category Concepts\n\nDocumentation coming soon.';
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
      path.join(this.outputDir, '.gitignore'),
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
      path.join(this.outputDir, '.env.template'),
      envTemplate
    );
  }

  /**
   * Copy automation scripts
   */
  copyAutomationScripts() {
    console.log('🤖 Copying automation scripts...');

    const autoFiles = ['generate-docs.js'];
    autoFiles.forEach(file => {
      const sourcePath = path.join(this.templateDir, 'automation', file);
      const targetPath = path.join(this.outputDir, 'automation', file);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  /**
   * Install dependencies in the new project
   */
  installDependencies() {
    console.log('📥 Installing dependencies...');
    console.log('   (This may take a few minutes)\n');

    try {
      execSync('npm install', {
        cwd: this.outputDir,
        stdio: 'inherit'
      });
    } catch (error) {
      console.warn('⚠️  Manual installation required. Run: cd', path.basename(this.outputDir), '&& npm install');
    }
  }

  /**
   * Format name for display
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
    console.error('❌ Usage: node create-fhevm-category.js <category> [output-dir]');
    console.error('\nAvailable categories:');
    Object.keys(CATEGORIES).forEach(cat => {
      console.error(`  - ${cat}: ${CATEGORIES[cat].description}`);
    });
    process.exit(1);
  }

  const [category, outputDir] = args;

  try {
    const generator = new CategoryProjectGenerator(category, outputDir);
    generator.generate();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { CategoryProjectGenerator, CATEGORIES };
