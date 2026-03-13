const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataAccessEscrow", function () {
  let consentRegistry;
  let dataAccessEscrow;
  let owner;
  let user;
  let company;

  beforeEach(async function () {
    [owner, user, company] = await ethers.getSigners();

    // Deploy ConsentRegistry first
    const ConsentRegistry = await ethers.getContractFactory("ConsentRegistry");
    consentRegistry = await ConsentRegistry.deploy();

    // Deploy DataAccessEscrow with ConsentRegistry address
    const DataAccessEscrow = await ethers.getContractFactory("DataAccessEscrow");
    dataAccessEscrow = await DataAccessEscrow.deploy(
      await consentRegistry.getAddress()
    );
  });

  // TEST 1
  it("Should refund company when no consent exists", async function () {
    const fee = ethers.parseEther("0.01");

    const companyBalanceBefore = await ethers.provider.getBalance(
      company.address
    );

    await dataAccessEscrow
      .connect(company)
      .depositFee(user.address, { value: fee });

    const companyBalanceAfter = await ethers.provider.getBalance(
      company.address
    );

    // Company should get refund minus gas fees
    expect(companyBalanceAfter).to.be.closeTo(
      companyBalanceBefore,
      ethers.parseEther("0.001")
    );
  });

  // TEST 2
  it("Should release payment to user when consent exists", async function () {
    // Give consent first
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    const fee = ethers.parseEther("0.01");

    await dataAccessEscrow
      .connect(company)
      .depositFee(user.address, { value: fee });

    // User should have earnings
    const userEarnings = await dataAccessEscrow.getEarnings(user.address);
    expect(userEarnings).to.be.gt(0);
  });

  // TEST 3
  it("Should split payment 50/50 correctly", async function () {
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    const fee = ethers.parseEther("0.01");

    await dataAccessEscrow
      .connect(company)
      .depositFee(user.address, { value: fee });

    const userEarnings = await dataAccessEscrow.getEarnings(user.address);
    const platformEarnings = await dataAccessEscrow.platformEarnings();

    // Both should be 50% of fee
    expect(userEarnings).to.equal(ethers.parseEther("0.005"));
    expect(platformEarnings).to.equal(ethers.parseEther("0.005"));
  });

  // TEST 4
  it("Should allow user to withdraw earnings", async function () {
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    const fee = ethers.parseEther("0.01");

    await dataAccessEscrow
      .connect(company)
      .depositFee(user.address, { value: fee });

    const balanceBefore = await ethers.provider.getBalance(user.address);

    await dataAccessEscrow.connect(user).withdrawEarnings();

    const balanceAfter = await ethers.provider.getBalance(user.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  // TEST 5
  it("Should fail withdrawal when no earnings", async function () {
    await expect(
      dataAccessEscrow.connect(user).withdrawEarnings()
    ).to.be.revertedWith("No earnings to withdraw");
  });

  // TEST 6
  it("Should allow owner to withdraw platform fees", async function () {
    await consentRegistry
      .connect(user)
      .giveConsent(company.address, "email", "KYC", 30);

    const fee = ethers.parseEther("0.01");

    await dataAccessEscrow
      .connect(company)
      .depositFee(user.address, { value: fee });

    await expect(
      dataAccessEscrow.connect(owner).withdrawPlatformFees()
    ).to.not.be.reverted;
  });
});