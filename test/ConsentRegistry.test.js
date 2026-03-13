const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConsentRegistry", function () {
  let consentRegistry;
  let owner;
  let user;
  let company;

  // Runs before every test
  beforeEach(async function () {
    [owner, user, company] = await ethers.getSigners();
    const ConsentRegistry = await ethers.getContractFactory("ConsentRegistry");
    consentRegistry = await ConsentRegistry.deploy();
  });

  // TEST 1
  it("Should give consent successfully", async function () {
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    const consent = await consentRegistry.getConsent(
      user.address,
      company.address
    );

    expect(consent.dataType).to.equal("email");
    expect(consent.purpose).to.equal("KYC");
    expect(consent.isActive).to.equal(true);
  });

  // TEST 2
  it("Should check consent returns true when active", async function () {
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    const hasConsent = await consentRegistry.checkConsent(
      user.address,
      company.address
    );

    expect(hasConsent).to.equal(true);
  });

  // TEST 3
  it("Should revoke consent successfully", async function () {
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    await consentRegistry.connect(user).revokeConsent(company.address);

    const hasConsent = await consentRegistry.checkConsent(
      user.address,
      company.address
    );

    expect(hasConsent).to.equal(false);
  });

  // TEST 4
  it("Should return false when no consent given", async function () {
    const hasConsent = await consentRegistry.checkConsent(
      user.address,
      company.address
    );

    expect(hasConsent).to.equal(false);
  });

  // TEST 5
  it("Should fail revoking non-existent consent", async function () {
    await expect(
      consentRegistry.connect(user).revokeConsent(company.address)
    ).to.be.revertedWith("No active consent found");
  });
});