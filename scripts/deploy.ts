/**
 * @title Deployment Script
 * @description Deploys the ConfidentialFertilityRecords contract to specified networks
 * @chapter deployment
 *
 * **Usage:**
 * - Local: `npm run deploy`
 * - Sepolia: `npm run deploy:sepolia`
 *
 * **Prerequisites:**
 * 1. Set PRIVATE_KEY in .env file
 * 2. Ensure sufficient ETH balance for deployment
 * 3. Network RPC URL configured in hardhat.config.ts
 */

import { ethers } from "hardhat";

/**
 * @async
 * @function main
 * @description Main deployment function
 * @returns {Promise<void>}
 *
 * **Deployment Steps:**
 * 1. Get deployer signer
 * 2. Deploy the contract
 * 3. Verify deployment
 * 4. Log contract address and details
 */
async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deploying from account: ${deployer.address}`);

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (ChainID: ${network.chainId})`);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH\n`);

  // Check balance
  if (balance === 0n) {
    console.error("❌ Error: Account has no balance. Please fund the account.");
    process.exit(1);
  }

  try {
    /**
     * @step Deploy the ConfidentialFertilityRecords contract
     * @description Instantiate and deploy the contract with no constructor arguments
     */
    console.log("📋 Deploying ConfidentialFertilityRecords contract...");
    const ContractFactory = await ethers.getContractFactory("ConfidentialFertilityRecords");
    const contract = await ContractFactory.deploy();

    /**
     * @step Wait for deployment confirmation
     * @description Wait for the transaction to be mined
     */
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    /**
     * @success Log deployment success
     */
    console.log(`✅ Contract deployed successfully!`);
    console.log(`📬 Contract Address: ${contractAddress}\n`);

    /**
     * @step Log deployment details
     * @description Store important deployment information
     */
    console.log("📊 Deployment Details:");
    console.log(`  - Network: ${network.name}`);
    console.log(`  - Chain ID: ${network.chainId}`);
    console.log(`  - Deployer: ${deployer.address}`);
    console.log(`  - Contract: ${contractAddress}`);

    /**
     * @info Post-deployment instructions
     */
    console.log("\n📝 Next Steps:");
    console.log("1. Update CONTRACT_ADDRESS in public/index.html with the contract address above");
    console.log("2. Authorize healthcare providers:");
    console.log(`   npx hardhat run scripts/authorize-doctor.ts --network ${network.name}`);
    console.log("3. Run tests to verify functionality:");
    console.log("   npm test");

    /**
     * @warning For mainnet deployments
     */
    if (network.chainId === 1) {
      console.log("\n⚠️  MAINNET DEPLOYMENT DETECTED");
      console.log("   Please verify the contract address carefully before using");
    }

    /**
     * @info Save deployment address to environment
     */
    console.log(`\n💾 Add to .env file:`);
    console.log(`DEPLOYED_CONTRACT_ADDRESS=${contractAddress}`);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("\n❌ Deployment failed!");
      console.error(`Error: ${error.message}`);

      if (error.message.includes("insufficient funds")) {
        console.error("\n💡 Tip: You need ETH to deploy. Fund your account on a testnet faucet.");
      }
    }
    process.exit(1);
  }
}

/**
 * @execute Run the deployment
 */
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
