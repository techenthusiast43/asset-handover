const hre = require("hardhat");
const contractConfig = require("../../frontend/src/contracts/contractConfig.json");

async function main() {
  console.log("==================================================");
  console.log("Interacting with AssetHandover on BOT Chain Testnet");
  console.log("Contract Address:", contractConfig.address);
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Signer Wallet:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Wallet Balance:", hre.ethers.formatEther(balance), "BOT");

  const AssetHandover = await hre.ethers.getContractFactory("AssetHandover");
  const contract = AssetHandover.attach(contractConfig.address);

  // 1. Check total existing assets
  const initialCount = await contract.getTotalAssetCount();
  console.log("Current Registered Assets on-chain:", initialCount.toString());

  // 2. Register a demonstration physical asset
  const demoRef = `TAG-ENT-${Date.now().toString().slice(-6)}`;
  console.log(`\nRegistering sample physical asset (Ref: ${demoRef})...`);

  const tx = await contract.registerAsset(
    "Dell Latitude 5440 Enterprise",
    demoRef,
    "14-inch Core i7 32GB corporate laptop assigned to DevOps",
    "IT Equipment"
  );
  console.log("Transaction submitted. Tx Hash:", tx.hash);
  console.log("Explorer URL: https://scan.bohr.life/tx/" + tx.hash);

  console.log("Waiting for block confirmation on BOT Chain...");
  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt.blockNumber);

  // 3. Query all assets to confirm retrieval
  const totalCount = await contract.getTotalAssetCount();
  console.log("Updated Total Asset Count:", totalCount.toString());

  const assets = await contract.getAllAssets();
  const latest = assets[assets.length - 1];
  console.log("\n--------------------------------------------------");
  console.log("Asset Retrieved Successfully from BOT Chain:");
  console.log("Asset ID:", latest.assetId);
  console.log("Name:", latest.name);
  console.log("Reference:", latest.assetRef);
  console.log("Custodian:", latest.currentCustodian);
  console.log("Original Owner:", latest.originalOwner);
  console.log("Category:", latest.category);
  console.log("--------------------------------------------------");
  console.log("Verification complete! Real blockchain interactions confirmed.");
}

main().catch((err) => {
  console.error("Interaction failed:", err);
  process.exitCode = 1;
});
