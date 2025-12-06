/**
 * @title FHEVM Example Scaffolding Tool
 * @description CLI tool to scaffold new FHEVM example repositories
 * @chapter automation
 *
 * **Usage:**
 * ```bash
 * npm run scaffold
 * ```
 *
 * This tool helps quickly create new FHEVM example repositories by:
 * 1. Creating project structure
 * 2. Setting up Hardhat configuration
 * 3. Generating example smart contracts
 * 4. Creating test templates
 * 5. Setting up documentation
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

/**
 * @interface ProjectConfig
 * @description Configuration for a new FHEVM example project
 */
interface ProjectConfig {
  name: string;
  description: string;
  category: string;
  concepts: string[];
  author: string;
}

/**
 * @function promptUser
 * @description Interactive prompts for project configuration
 * @returns {Promise<ProjectConfig>} User-provided configuration
 */
async function promptUser(): Promise<ProjectConfig> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  console.log("\n🚀 FHEVM Example Scaffolding Tool\n");
  console.log("Answer the following questions to create your FHEVM example:\n");

  const name = await question("📝 Project name (e.g., access-control-example): ");
  const description = await question("📖 Project description: ");

  console.log("\n📂 Category:");
  console.log("  1. Basic Operations");
  console.log("  2. Access Control");
  console.log("  3. Privacy Patterns");
  console.log("  4. Advanced Patterns");
  const categoryChoice = await question("   Select (1-4): ");

  const categoryMap: { [key: string]: string } = {
    "1": "basic",
    "2": "access-control",
    "3": "privacy",
    "4": "advanced",
  };
  const category = categoryMap[categoryChoice] || "basic";

  console.log("\n🎯 Concepts:");
  console.log("  1. Encryption");
  console.log("  2. Access Control");
  console.log("  3. User Decryption");
  console.log("  4. Input Validation");
  const conceptChoice = await question("   Select concept (1-4): ");

  const conceptMap: { [key: string]: string } = {
    "1": "encryption",
    "2": "access-control",
    "3": "user-decryption",
    "4": "input-validation",
  };
  const concepts = [conceptMap[conceptChoice] || "encryption"];

  const author = await question("👤 Author name: ");

  rl.close();

  return {
    name,
    description,
    category,
    concepts,
    author,
  };
}

/**
 * @function createProjectStructure
 * @description Creates the directory structure for a new FHEVM example
 * @param {string} projectPath - Path to create project
 * @returns {void}
 */
function createProjectStructure(projectPath: string): void {
  const dirs = [
    "contracts",
    "test",
    "scripts",
    "docs",
  ];

  dirs.forEach((dir) => {
    const dirPath = path.join(projectPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`   ✅ Created directory: ${dir}/`);
    }
  });
}

/**
 * @function generatePackageJson
 * @description Generates package.json for the project
 * @param {ProjectConfig} config - Project configuration
 * @returns {string} Package.json content
 */
function generatePackageJson(config: ProjectConfig): string {
  return `{
  "name": "fhevm-${config.name}",
  "version": "1.0.0",
  "description": "${config.description}",
  "main": "index.js",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.ts",
    "node": "hardhat node",
    "clean": "hardhat clean"
  },
  "keywords": [
    "fhevm",
    "zama",
    "fhe",
    "privacy",
    "${config.category}",
    "${config.concepts.join('", "')}"
  ],
  "author": "${config.author}",
  "license": "MIT",
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@typechain/hardhat": "^9.0.0",
    "hardhat": "^2.19.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "@fhevm/contracts": "^0.5.0"
  }
}
`;
}

/**
 * @function generateContractTemplate
 * @description Generates a template Solidity contract
 * @param {ProjectConfig} config - Project configuration
 * @returns {string} Solidity contract content
 */
function generateContractTemplate(config: ProjectConfig): string {
  const contractName = config.name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ${contractName}
 * @description ${config.description}
 * @author ${config.author}
 *
 * **FHEVM Concepts Demonstrated:**
 * ${config.concepts.map((c) => `- ${c}`).join("\n * ")}
 *
 * **Category:** ${config.category}
 */

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ${contractName} is SepoliaConfig {
  /**
   * @dev Contract state variables
   */
  address public owner;

  /**
   * @dev Events for state changes
   */
  event Initialized();

  /**
   * @dev Access control modifier
   */
  modifier onlyOwner() {
    require(msg.sender == owner, "Unauthorized");
    _;
  }

  /**
   * @notice Initialize the contract
   * @description Sets up the contract and initializes owner
   */
  constructor() {
    owner = msg.sender;
    emit Initialized();
  }

  /**
   * @notice Example function demonstrating encryption
   * @description This function demonstrates FHE encryption patterns
   * @param _value Plain value to encrypt
   *
   * **FHEVM Pattern:**
   * 1. Input is received as plain value
   * 2. FHE.asEuint8() encrypts the value
   * 3. Encrypted value can be used in computations
   * 4. Result stays encrypted on-chain
   */
  function encrypt(uint8 _value) external pure returns (bytes32) {
    euint8 encryptedValue = FHE.asEuint8(_value);
    return FHE.toBytes32(encryptedValue);
  }

  // TODO: Add your example functions here
  // Remember to use JSDoc annotations for documentation generation
}
`;
}

/**
 * @function generateTestTemplate
 * @description Generates a template test file
 * @param {ProjectConfig} config - Project configuration
 * @returns {string} Test file content
 */
function generateTestTemplate(config: ProjectConfig): string {
  const contractName = config.name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return `/**
 * @title ${contractName} Test Suite
 * @description Comprehensive tests for ${config.description}
 * @chapter ${config.concepts[0]}
 * @category ${config.category}
 *
 * This test suite demonstrates:
 * ${config.concepts.map((c) => `- ${c}`).join("\n * ")}
 */

import { expect } from "chai";
import { ethers } from "hardhat";

describe("${contractName}", function () {
  let contract: any;
  let owner: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("${contractName}");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    /**
     * @test Should deploy successfully
     */
    it("Should deploy successfully", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  // TODO: Add more test cases here
  // Use JSDoc annotations for documentation generation:
  // /**
  //  * @test Test name
  //  * @description Description of what this tests
  //  * @chapter chapter-name
  //  */
});
`;
}

/**
 * @function generateReadme
 * @description Generates a README file
 * @param {ProjectConfig} config - Project configuration
 * @returns {string} README content
 */
function generateReadme(config: ProjectConfig): string {
  return `# ${config.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} FHEVM Example

${config.description}

## Features

- FHEVM-based smart contract
- Comprehensive test suite
- Clear documentation

## Concepts Demonstrated

${config.concepts.map((c) => `- **${c}**: See test/\${contractName}.test.ts for examples`).join("\n")}

## Quick Start

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Compile Contract
\`\`\`bash
npm run compile
\`\`\`

### Run Tests
\`\`\`bash
npm test
\`\`\`

### Deploy
\`\`\`bash
npm run deploy
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/      # Solidity smart contracts
├── test/          # Test files with JSDoc annotations
├── scripts/       # Deployment and utility scripts
├── docs/          # Generated documentation
└── hardhat.config.ts
\`\`\`

## Author

${config.author}

## License

MIT
`;
}

/**
 * @async
 * @function main
 * @description Main scaffolding function
 */
async function main() {
  try {
    const config = await promptUser();

    // Create project directory
    const projectPath = path.join(process.cwd(), `fhevm-${config.name}`);

    console.log(`\n📁 Creating project at: ${projectPath}\n`);

    if (fs.existsSync(projectPath)) {
      console.error(`❌ Directory already exists: ${projectPath}`);
      process.exit(1);
    }

    fs.mkdirSync(projectPath, { recursive: true });

    // Create structure
    console.log("📂 Creating project structure:");
    createProjectStructure(projectPath);

    // Generate files
    console.log("\n📝 Generating files:");

    // package.json
    fs.writeFileSync(path.join(projectPath, "package.json"), generatePackageJson(config));
    console.log("   ✅ package.json");

    // hardhat.config.ts (copy from template)
    const hardhatConfig = `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
`;
    fs.writeFileSync(path.join(projectPath, "hardhat.config.ts"), hardhatConfig);
    console.log("   ✅ hardhat.config.ts");

    // Contract
    const contractName = config.name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    fs.writeFileSync(
      path.join(projectPath, "contracts", `${contractName}.sol`),
      generateContractTemplate(config)
    );
    console.log(`   ✅ contracts/${contractName}.sol`);

    // Test
    fs.writeFileSync(
      path.join(projectPath, "test", `${contractName}.test.ts`),
      generateTestTemplate(config)
    );
    console.log(`   ✅ test/${contractName}.test.ts`);

    // README
    fs.writeFileSync(path.join(projectPath, "README.md"), generateReadme(config));
    console.log("   ✅ README.md");

    console.log(`\n✅ Project created successfully!\n`);
    console.log(`📦 Next steps:`);
    console.log(`   cd fhevm-${config.name}`);
    console.log(`   npm install`);
    console.log(`   npm test\n`);

  } catch (error) {
    console.error("❌ Scaffolding failed!");
    console.error(error);
    process.exit(1);
  }
}

/**
 * @execute Run the scaffolding tool
 */
main();
