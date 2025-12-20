#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * @fileoverview Documentation Generator for FHEVM Examples
 *
 * Generates GitBook-compatible documentation from:
 * - JSDoc/TSDoc comments in test files
 * - Solidity contract comments
 * - README content
 *
 * Output: Markdown files in docs/ directory
 *
 * Usage: node automation/generate-docs.js
 *
 * @category automation
 * @category documentation
 */

class DocumentationGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsDir = path.join(this.projectRoot, 'docs');
    this.categories = new Map();
    this.examples = [];
  }

  /**
   * Main generation entry point
   */
  async generate() {
    console.log('📚 Generating FHEVM Example Documentation\n');

    try {
      this.ensureDocsDirectory();
      this.parseTestFiles();
      this.parseContractFiles();
      this.generateSummary();
      this.generateCategoryPages();
      this.generateConceptPages();
      this.generateQuickStart();
      this.copyReadme();

      console.log('\n✅ Documentation generated successfully!');
      console.log(`📂 Documentation available in: ${this.docsDir}\n`);
    } catch (error) {
      console.error('❌ Error generating documentation:', error.message);
      process.exit(1);
    }
  }

  /**
   * Ensure docs directory exists
   */
  ensureDocsDirectory() {
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }

    const subdirs = ['concepts', 'examples', 'api'];
    subdirs.forEach(dir => {
      const dirPath = path.join(this.docsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    console.log('📁 Created documentation structure');
  }

  /**
   * Parse test files for documented examples
   */
  parseTestFiles() {
    console.log('🔍 Parsing test files...');

    const testDir = path.join(this.projectRoot, 'test');
    if (!fs.existsSync(testDir)) {
      console.warn('⚠️  No test directory found');
      return;
    }

    const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));

    testFiles.forEach(file => {
      const filePath = path.join(testDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract fileoverview and categories
      const fileoverviewMatch = content.match(/@fileoverview\s+([^\n]+)/);
      const categoryMatches = content.matchAll(/@category\s+([^\n]+)/g);

      if (fileoverviewMatch) {
        const example = {
          name: file.replace('.test.js', ''),
          description: fileoverviewMatch[1].trim(),
          categories: [],
          tests: []
        };

        for (const match of categoryMatches) {
          const category = match[1].trim();
          example.categories.push(category);

          if (!this.categories.has(category)) {
            this.categories.set(category, []);
          }
          this.categories.get(category).push(example.name);
        }

        // Extract test cases with documentation
        const testPattern = /\/\*\*\s*\n\s*\*\s*Test:\s*([^\n]+)\s*\n\s*\*\s*Demonstrates:\s*([^*]+)\*\//g;
        let testMatch;

        while ((testMatch = testPattern.exec(content)) !== null) {
          example.tests.push({
            title: testMatch[1].trim(),
            demonstrates: testMatch[2].trim()
          });
        }

        this.examples.push(example);
      }
    });

    console.log(`   Found ${this.examples.length} documented examples`);
  }

  /**
   * Parse contract files for API documentation
   */
  parseContractFiles() {
    console.log('📝 Parsing contract files...');

    const contractsDir = path.join(this.projectRoot, 'contracts');
    if (!fs.existsSync(contractsDir)) {
      console.warn('⚠️  No contracts directory found');
      return;
    }

    const contractFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith('.sol'));

    contractFiles.forEach(file => {
      const filePath = path.join(contractsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract contract name
      const contractMatch = content.match(/contract\s+(\w+)/);
      if (!contractMatch) return;

      const contractName = contractMatch[1];
      const apiDoc = this.generateApiDoc(contractName, content);

      fs.writeFileSync(
        path.join(this.docsDir, 'api', `${contractName}.md`),
        apiDoc
      );
    });

    console.log(`   Generated API docs for ${contractFiles.length} contracts`);
  }

  /**
   * Generate API documentation for a contract
   */
  generateApiDoc(contractName, content) {
    let doc = `# ${contractName} API Reference\n\n`;

    // Extract functions
    const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)\s*(?:external|public)(?:\s+view)?\s*(?:returns\s*\(([^)]*)\))?/g;
    const functions = [];
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      functions.push({
        name: match[1],
        params: match[2],
        returns: match[3] || 'none'
      });
    }

    if (functions.length > 0) {
      doc += `## Functions\n\n`;

      functions.forEach(func => {
        doc += `### ${func.name}\n\n`;
        doc += `\`\`\`solidity\n`;
        doc += `function ${func.name}(${func.params})`;
        if (func.returns !== 'none') {
          doc += ` returns (${func.returns})`;
        }
        doc += `\n\`\`\`\n\n`;
      });
    }

    // Extract events
    const eventPattern = /event\s+(\w+)\s*\(([^)]*)\)/g;
    const events = [];

    while ((match = eventPattern.exec(content)) !== null) {
      events.push({
        name: match[1],
        params: match[2]
      });
    }

    if (events.length > 0) {
      doc += `## Events\n\n`;

      events.forEach(event => {
        doc += `### ${event.name}\n\n`;
        doc += `\`\`\`solidity\n`;
        doc += `event ${event.name}(${event.params})\n`;
        doc += `\`\`\`\n\n`;
      });
    }

    return doc;
  }

  /**
   * Generate SUMMARY.md for GitBook
   */
  generateSummary() {
    console.log('📋 Generating SUMMARY.md...');

    let summary = `# Table of Contents\n\n`;
    summary += `* [Introduction](README.md)\n`;
    summary += `* [Quick Start](quick-start.md)\n\n`;

    summary += `## Concepts\n\n`;
    for (const [category, examples] of this.categories.entries()) {
      const categorySlug = category.replace(/\s+/g, '-').toLowerCase();
      summary += `* [${this.formatCategory(category)}](concepts/${categorySlug}.md)\n`;
    }

    summary += `\n## Examples\n\n`;
    this.examples.forEach(example => {
      summary += `* [${this.formatName(example.name)}](examples/${example.name}.md)\n`;
    });

    summary += `\n## API Reference\n\n`;
    const apiFiles = fs.readdirSync(path.join(this.docsDir, 'api'));
    apiFiles.forEach(file => {
      const name = file.replace('.md', '');
      summary += `* [${name}](api/${file})\n`;
    });

    fs.writeFileSync(path.join(this.docsDir, 'SUMMARY.md'), summary);
  }

  /**
   * Generate category overview pages
   */
  generateCategoryPages() {
    console.log('🏷️  Generating category pages...');

    for (const [category, examples] of this.categories.entries()) {
      const categorySlug = category.replace(/\s+/g, '-').toLowerCase();
      let content = `# ${this.formatCategory(category)}\n\n`;

      content += this.getCategoryDescription(category);
      content += `\n## Examples in this Category\n\n`;

      examples.forEach(exampleName => {
        const example = this.examples.find(e => e.name === exampleName);
        if (example) {
          content += `### [${this.formatName(exampleName)}](../examples/${exampleName}.md)\n\n`;
          content += `${example.description}\n\n`;
        }
      });

      fs.writeFileSync(
        path.join(this.docsDir, 'concepts', `${categorySlug}.md`),
        content
      );
    }
  }

  /**
   * Get description for a category
   */
  getCategoryDescription(category) {
    const descriptions = {
      'access-control': `## Understanding Access Control in FHEVM

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
`,

      'public-decryption': `## Public Decryption Workflow

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
`,

      'encrypted-computation': `## Encrypted Computation

FHEVM enables computation directly on encrypted values without decryption. This preserves privacy while allowing complex operations.

### Key Concepts

- **euint8/16/32**: Encrypted unsigned integers
- **ebool**: Encrypted boolean values
- **FHE Operations**: add, sub, mul, eq, lt, gt, etc.

### When to Use

Use encrypted computation for:
- Privacy-preserving calculations
- Confidential business logic
- Secure multi-party computation
`
    };

    return descriptions[category] || `## ${this.formatCategory(category)}\n\n`;
  }

  /**
   * Generate individual example pages
   */
  generateConceptPages() {
    console.log('📖 Generating example pages...');

    this.examples.forEach(example => {
      let content = `# ${this.formatName(example.name)}\n\n`;
      content += `${example.description}\n\n`;

      if (example.categories.length > 0) {
        content += `**Categories:** ${example.categories.map(c => `\`${c}\``).join(', ')}\n\n`;
      }

      content += `## Test Cases\n\n`;
      content += `This example includes the following test cases:\n\n`;

      example.tests.forEach((test, idx) => {
        content += `### ${idx + 1}. ${test.title}\n\n`;
        content += `**Demonstrates:** ${test.demonstrates}\n\n`;
      });

      content += `## Running the Example\n\n`;
      content += `\`\`\`bash\n`;
      content += `npm test\n`;
      content += `\`\`\`\n\n`;

      content += `## Related Concepts\n\n`;
      example.categories.forEach(cat => {
        const categorySlug = cat.replace(/\s+/g, '-').toLowerCase();
        content += `- [${this.formatCategory(cat)}](../concepts/${categorySlug}.md)\n`;
      });

      fs.writeFileSync(
        path.join(this.docsDir, 'examples', `${example.name}.md`),
        content
      );
    });
  }

  /**
   * Generate Quick Start guide
   */
  generateQuickStart() {
    console.log('🚀 Generating Quick Start guide...');

    const content = `# Quick Start Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Basic understanding of Ethereum and Solidity

## Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/your-username/fhevm-examples
cd fhevm-examples
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

## Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

## Run Tests

\`\`\`bash
npm test
\`\`\`

For verbose output:

\`\`\`bash
npm run test:verbose
\`\`\`

For gas reporting:

\`\`\`bash
npm run test:gas
\`\`\`

## Local Deployment

1. Start a local Hardhat node:

\`\`\`bash
npm run node
\`\`\`

2. In another terminal, deploy:

\`\`\`bash
npm run deploy:local
\`\`\`

## Testnet Deployment

1. Create \`.env\` file:

\`\`\`bash
cp .env.template .env
\`\`\`

2. Add your credentials:

\`\`\`
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
\`\`\`

3. Deploy to Sepolia:

\`\`\`bash
npm run deploy
\`\`\`

## Next Steps

- Explore the [Concepts](concepts/) section
- Review the [Examples](examples/)
- Check the [API Reference](api/)

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [Community Discord](https://discord.gg/zama)
`;

    fs.writeFileSync(path.join(this.docsDir, 'quick-start.md'), content);
  }

  /**
   * Copy README to docs
   */
  copyReadme() {
    console.log('📄 Copying README...');

    const readmePath = path.join(this.projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
      fs.copyFileSync(readmePath, path.join(this.docsDir, 'README.md'));
    }
  }

  /**
   * Format category name
   */
  formatCategory(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format example name
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
  const generator = new DocumentationGenerator();
  generator.generate();
}

module.exports = DocumentationGenerator;
