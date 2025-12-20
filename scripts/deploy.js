const { ethers } = require("hardhat");

async function main() {
    console.log("Starting deployment of AnonymousMedicalReview contract...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get account balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Get the contract factory
    const AnonymousMedicalReview = await ethers.getContractFactory("AnonymousMedicalReview");

    // Deploy the contract
    console.log("Deploying AnonymousMedicalReview contract...");
    const contract = await AnonymousMedicalReview.deploy();

    // Wait for deployment
    await contract.deployed();

    console.log("✅ AnonymousMedicalReview deployed to:", contract.address);
    console.log("✅ Transaction hash:", contract.deployTransaction.hash);

    // Verify deployment
    const platform = await contract.platform();
    const doctorCount = await contract.doctorCount();
    const reviewCount = await contract.reviewCount();

    console.log("\n📋 Deployment Verification:");
    console.log("Platform address:", platform);
    console.log("Initial doctor count:", doctorCount.toString());
    console.log("Initial review count:", reviewCount.toString());

    console.log("\n🔧 Contract deployed successfully!");
    console.log("📝 Please update the CONTRACT_ADDRESS in index.html with:", contract.address);

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        contractAddress: contract.address,
        deployerAddress: deployer.address,
        transactionHash: contract.deployTransaction.hash,
        blockNumber: contract.deployTransaction.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: contract.deployTransaction.gasLimit?.toString(),
        contractABI: [
            "function registerDoctor(string memory _name, string memory _specialty, string memory _clinic) external returns (uint256)",
            "function submitAnonymousReview(uint256 _doctorId, uint8 _rating, uint8 _professionalism, uint8 _communication, uint8 _waitTime, string memory _encryptedComment) external",
            "function requestRatingAggregation(uint256 _doctorId) external",
            "function getDoctorInfo(uint256 _doctorId) external view returns (string memory name, string memory specialty, string memory clinic, uint256 totalReviews, uint256 registrationTime)",
            "function getDoctorRating(uint256 _doctorId) external view returns (uint8 averageRating, uint8 averageProfessionalism, uint8 averageCommunication, uint8 averageWaitTime, uint256 totalReviews, uint256 lastUpdated, bool isRevealed)",
            "function getReviewStatus(address _reviewer, uint256 _doctorId) external view returns (bool)",
            "function getAllDoctorsCount() external view returns (uint256)",
            "function canRequestAggregation(uint256 _doctorId) external view returns (bool)",
            "event DoctorRegistered(uint256 indexed doctorId, string name, string specialty)",
            "event ReviewSubmitted(uint256 indexed reviewId, uint256 indexed doctorId, address indexed reviewer)",
            "event RatingRevealed(uint256 indexed doctorId, uint8 averageRating, uint256 totalReviews)"
        ]
    };

    // Write deployment info to file
    const fs = require("fs");
    fs.writeFileSync(
        "./deployment-info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Deployment info saved to deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });