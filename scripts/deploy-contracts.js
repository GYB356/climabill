const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load contract ABI and bytecode
  const contractPath = path.join(__dirname, "../src/lib/blockchain/contracts/InvoiceContract.json");
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  
  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log(`Deploying contracts with account: ${wallet.address}`);
  
  // Deploy the contract
  const InvoiceContract = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  
  const invoiceContract = await InvoiceContract.deploy();
  await invoiceContract.deployed();
  
  console.log(`InvoiceContract deployed to: ${invoiceContract.address}`);
  
  // Save the contract address to a config file
  const configPath = path.join(__dirname, "../src/lib/blockchain/config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  
  // Update the contract address for the specified network
  const network = process.env.ETHEREUM_NETWORK || "goerli";
  if (!config.contractAddresses) {
    config.contractAddresses = {};
  }
  
  if (!config.contractAddresses[network]) {
    config.contractAddresses[network] = {};
  }
  
  config.contractAddresses[network].invoiceContract = invoiceContract.address;
  config.contractAddresses.lastDeployed = {
    network,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Contract address saved to ${configPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
