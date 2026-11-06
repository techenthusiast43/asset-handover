const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying AssetHandover to:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BOT");

  const AssetHandover = await hre.ethers.getContractFactory("AssetHandover");
  const contract = await AssetHandover.deploy();
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log("AssetHandover deployed successfully to:", deployedAddress);
  console.log("--------------------------------------------------");

  // Export deployment info for the frontend
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("AssetHandover");
  const contractData = {
    address: deployedAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    abi: contractArtifact.abi,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "contractConfig.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Saved contractConfig.json to frontend/src/contracts/");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

