const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("Deploying SoftwareLicense Smart Contract...");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const SoftwareLicense = await hre.ethers.getContractFactory("SoftwareLicense");
  const softwareLicense = await SoftwareLicense.deploy();
  await softwareLicense.waitForDeployment();

  const contractAddress = await softwareLicense.getAddress();
  const networkName = hre.network.name;

  console.log("\n==================================================");
  console.log("Contract deployed successfully");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", networkName);
  console.log("Company Admin:", deployer.address);
  console.log("==================================================\n");

  // Export ABI and address for frontend and backend
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/SoftwareLicense.sol/SoftwareLicense.json"
  );

  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  const deploymentData = {
    address: contractAddress,
    network: networkName,
    companyAdmin: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: abi
  };

  const targetDirs = [
    path.join(__dirname, "../../frontend/src/contracts"),
    path.join(__dirname, "../../src/contracts"),
    path.join(__dirname, "../../backend/app/blockchain")
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const outputPath = path.join(dir, "SoftwareLicenseConfig.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
    console.log(`Saved deployment config to: ${outputPath}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
