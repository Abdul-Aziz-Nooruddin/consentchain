const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ConsentRegistry = await ethers.getContractFactory("ConsentRegistry");
  const consentRegistry = await ConsentRegistry.deploy();
  await consentRegistry.waitForDeployment();
  console.log("ConsentRegistry deployed to:", await consentRegistry.getAddress());

  const DataAccessEscrow = await ethers.getContractFactory("DataAccessEscrow");
  const dataAccessEscrow = await DataAccessEscrow.deploy(await consentRegistry.getAddress());
  await dataAccessEscrow.waitForDeployment();
  console.log("DataAccessEscrow deployed to:", await dataAccessEscrow.getAddress());

  const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy();
  await subscriptionManager.waitForDeployment();
  console.log("SubscriptionManager deployed to:", await subscriptionManager.getAddress());

  const UserEarningsWallet = await ethers.getContractFactory("UserEarningsWallet");
  const userEarningsWallet = await UserEarningsWallet.deploy();
  await userEarningsWallet.waitForDeployment();
  console.log("UserEarningsWallet deployed to:", await userEarningsWallet.getAddress());

  console.log("All contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});