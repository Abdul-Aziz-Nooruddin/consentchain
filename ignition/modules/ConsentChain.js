const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ConsentChainModule", (m) => {
  const consentRegistry = m.contract("ConsentRegistry");
  const dataAccessEscrow = m.contract("DataAccessEscrow", [consentRegistry]);
  const subscriptionManager = m.contract("SubscriptionManager");
  const userEarningsWallet = m.contract("UserEarningsWallet");

  return {
    consentRegistry,
    dataAccessEscrow,
    subscriptionManager,
    userEarningsWallet,
  };
});