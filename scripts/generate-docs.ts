/**
 * @title Documentation Generator
 * @description Auto-generates GitBook-compatible markdown documentation from code annotations
 * @chapter documentation
 *
 * **Usage:**
 * ```bash
 * npm run docs:generate
 * ```
 *
 * **Generated Files:**
 * - docs/index.md (main documentation)
 * - docs/SUMMARY.md (GitBook sidebar)
 * - docs/guides/* (specific guides)
 *
 * **Annotation Format:**
 * ```typescript
 * /**
 *  * @title Section Title
 *  * @description Description of what this demonstrates
 *  * @chapter chapter-name
 *  * @category category-name
 *  * /
 * ```
 */

import * as fs from "fs";
import * as path from "path";

/**
 * @interface DocSection
 * @description Structure for parsed documentation sections
 */
interface DocSection {
  title: string;
  description: string;
  chapter: string;
  category: string;
  code: string;
  file: string;
}

/**
 * @function parseDocumentation
 * @description Parses JSDoc/TSDoc annotations from source files
 * @param {string} content - File content
 * @returns {DocSection[]} Parsed sections
 */
function parseDocumentation(content: string): DocSection[] {
  const sections: DocSection[] = [];
  const docRegex = /\/\*\*\s*([\s\S]*?)\*\//g;

  let match;
  while ((match = docRegex.exec(content)) !== null) {
    const docBlock = match[1];

    const titleMatch = docBlock.match(/@title\s+(.+)/);
    const descMatch = docBlock.match(/@description\s+(.+)/);
    const chapterMatch = docBlock.match(/@chapter\s+(.+)/);
    const categoryMatch = docBlock.match(/@category\s+(.+)/);

    if (titleMatch && descMatch) {
      sections.push({
        title: titleMatch[1].trim(),
        description: descMatch[1].trim(),
        chapter: chapterMatch ? chapterMatch[1].trim() : "general",
        category: categoryMatch ? categoryMatch[1].trim() : "general",
        code: match[0],
        file: "",
      });
    }
  }

  return sections;
}

/**
 * @function generateMarkdown
 * @description Generates markdown documentation from parsed sections
 * @param {DocSection[]} sections - Documentation sections
 * @returns {string} Markdown content
 */
function generateMarkdown(sections: DocSection[]): string {
  let markdown = `# FHEVM Fertility Records Example

> Privacy-preserving healthcare data management using Fully Homomorphic Encryption

## Overview

This is a comprehensive FHEVM example demonstrating encrypted fertility and reproductive health records management. The smart contract showcases important FHE concepts including:

- **Encryption**: Data encrypted on-chain using \`FHE.asEuint*()\`
- **Access Control**: Multi-level authorization patterns
- **User Decryption**: Controlled data access and retrieval
- **Privacy Patterns**: Healthcare privacy best practices

## Key Features

- ✅ End-to-end encrypted medical records
- ✅ Multi-level access control (system + patient)
- ✅ Emergency access mechanisms with audit trail
- ✅ Encrypted data updates
- ✅ Record deactivation and lifecycle management
- ✅ Role-based permissions (patients, healthcare providers, admins)

## Table of Contents

`;

  // Generate table of contents by chapter
  const chapters = new Set(sections.map((s) => s.chapter));
  chapters.forEach((chapter) => {
    const formatted = chapter
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    markdown += `- [${formatted}](#${chapter})\n`;
  });

  markdown += `\n## FHEVM Concepts Demonstrated\n\n`;

  // Add concept descriptions
  const concepts: { [key: string]: string } = {
    "access-control":
      "Demonstrates how to implement granular access control using modifiers and mappings. Includes system-level authorization and patient-level consent mechanisms.",
    encryption:
      "Shows how to encrypt sensitive data at contract deployment time using \`FHE.asEuint*()\` and \`FHE.asEbool()\` functions.",
    "user-decryption":
      "Demonstrates how to safely expose encrypted data to authorized users for decryption on the client side using handle-based access.",
    "input-proof":
      "Explains input validation and the importance of verifying data before encryption to prevent invalid states.",
    "best-practices":
      "Gas optimization, storage efficiency, and architectural patterns for FHEVM applications.",
  };

  Object.entries(concepts).forEach(([concept, desc]) => {
    if (chapters.has(concept)) {
      markdown += `### ${concept.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}\n${desc}\n\n`;
    }
  });

  // Group sections by chapter
  const sectionsByChapter: { [key: string]: DocSection[] } = {};
  sections.forEach((section) => {
    if (!sectionsByChapter[section.chapter]) {
      sectionsByChapter[section.chapter] = [];
    }
    sectionsByChapter[section.chapter].push(section);
  });

  // Generate documentation for each chapter
  chapters.forEach((chapter) => {
    const formatted = chapter
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    markdown += `## ${formatted} {#${chapter}}\n\n`;

    const chapterSections = sectionsByChapter[chapter] || [];
    chapterSections.forEach((section) => {
      markdown += `### ${section.title}\n\n`;
      markdown += `${section.description}\n\n`;
      markdown += `**Category**: \`${section.category}\`\n\n`;
    });
  });

  // Add testing section
  markdown += `\n## Testing\n\n`;
  markdown += `This example includes comprehensive tests demonstrating each FHEVM concept:\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm test\n`;
  markdown += `\`\`\`\n\n`;
  markdown += `Tests are organized by concept:\n`;
  markdown += `- Deployment and initialization\n`;
  markdown += `- Healthcare provider authorization\n`;
  markdown += `- Encrypted record creation\n`;
  markdown += `- Access control mechanisms\n`;
  markdown += `- Encrypted data updates\n`;
  markdown += `- Emergency access patterns\n`;
  markdown += `- Record retrieval and decryption\n`;
  markdown += `- Multi-patient scenarios\n`;

  // Add deployment section
  markdown += `\n## Deployment\n\n`;
  markdown += `### Local Testing\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run compile\n`;
  markdown += `npm run node\n`;
  markdown += `# In another terminal:\n`;
  markdown += `npm run deploy\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Sepolia Testnet\n\n`;
  markdown += `1. Set \`PRIVATE_KEY\` in \`.env\`:\n`;
  markdown += `   \`\`\`\n`;
  markdown += `   PRIVATE_KEY=your_private_key\n`;
  markdown += `   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY\n`;
  markdown += `   \`\`\`\n\n`;
  markdown += `2. Deploy to Sepolia:\n`;
  markdown += `   \`\`\`bash\n`;
  markdown += `   npm run deploy:sepolia\n`;
  markdown += `   \`\`\`\n\n`;

  // Add architecture section
  markdown += `\n## Contract Architecture\n\n`;
  markdown += `### Data Structures\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `// Encrypted medical data\n`;
  markdown += `struct EncryptedRecord {\n`;
  markdown += `    euint8 age;\n`;
  markdown += `    euint8 pregnancyCount;\n`;
  markdown += `    euint16 cycleLength;\n`;
  markdown += `    euint8 fertilityScore;\n`;
  markdown += `    ebool isUnderTreatment;\n`;
  markdown += `    // ... more encrypted fields\n`;
  markdown += `}\n\n`;
  markdown += `// Non-encrypted metadata\n`;
  markdown += `struct RecordMetadata {\n`;
  markdown += `    address patient;\n`;
  markdown += `    address authorizedDoctor;\n`;
  markdown += `    uint256 createdAt;\n`;
  markdown += `    bool emergencyAccess;\n`;
  markdown += `    string ipfsHash;\n`;
  markdown += `}\n`;
  markdown += `\`\`\`\n\n`;

  // Add access patterns
  markdown += `### Access Patterns\n\n`;
  markdown += `**System-Level Authorization**\n`;
  markdown += `- Owner authorizes healthcare providers as system administrators\n`;
  markdown += `- Required before providers can access any records\n\n`;
  markdown += `**Patient-Level Authorization**\n`;
  markdown += `- Patients grant access to specific healthcare providers\n`;
  markdown += `- Each provider-patient relationship is independent\n`;
  markdown += `- Patients can revoke access at any time\n\n`;
  markdown += `**Emergency Access**\n`;
  markdown += `- Healthcare providers can request emergency access\n`;
  markdown += `- Bypasses patient consent in critical situations\n`;
  markdown += `- All emergency accesses are logged for audit trail\n\n`;

  return markdown;
}

/**
 * @function main
 * @description Main documentation generation function
 */
async function main() {
  console.log("📚 Generating documentation...\n");

  try {
    // Parse test files
    const testDir = path.join(__dirname, "..", "test");
    const testFiles = fs.readdirSync(testDir).filter((f) => f.endsWith(".test.ts"));

    let allSections: DocSection[] = [];

    for (const file of testFiles) {
      const content = fs.readFileSync(path.join(testDir, file), "utf-8");
      const sections = parseDocumentation(content);
      sections.forEach((s) => (s.file = file));
      allSections = allSections.concat(sections);
    }

    // Generate markdown
    const markdown = generateMarkdown(allSections);

    // Create docs directory
    const docsDir = path.join(__dirname, "..", "docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Write README
    fs.writeFileSync(path.join(docsDir, "index.md"), markdown);
    console.log(`✅ Generated docs/index.md (${markdown.length} bytes)`);

    // Generate SUMMARY.md for GitBook
    let summary = `# Table of Contents\n\n`;
    summary += `- [Introduction](README.md)\n`;
    summary += `- [FHEVM Fertility Records](index.md)\n`;
    summary += `  - [Overview](#overview)\n`;
    summary += `  - [Key Features](#key-features)\n`;
    summary += `  - [Testing](#testing)\n`;
    summary += `  - [Deployment](#deployment)\n`;
    summary += `  - [Architecture](#contract-architecture)\n`;

    fs.writeFileSync(path.join(docsDir, "SUMMARY.md"), summary);
    console.log(`✅ Generated docs/SUMMARY.md`);

    console.log(`\n📖 Documentation generated successfully!`);
    console.log(`   Found ${allSections.length} documented sections`);
    console.log(`   Output: ${docsDir}\n`);

  } catch (error) {
    console.error("❌ Documentation generation failed!");
    console.error(error);
    process.exit(1);
  }
}

/**
 * @execute Run documentation generation
 */
main();
