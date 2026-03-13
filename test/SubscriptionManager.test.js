const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SubscriptionManager", function () {
  let subscriptionManager;
  let owner;
  let company;

  beforeEach(async function () {
    [owner, company] = await ethers.getSigners();

    const SubscriptionManager = await ethers.getContractFactory(
      "SubscriptionManager"
    );
    subscriptionManager = await SubscriptionManager.deploy();
  });

  // TEST 1
  it("Should subscribe to Starter plan successfully", async function () {
    const price = await subscriptionManager.starterPrice();

    await subscriptionManager
      .connect(company)
      .subscribe(1, { value: price });

    const isSubscribed = await subscriptionManager.isSubscribed(
      company.address
    );

    expect(isSubscribed).to.equal(true);
  });

  // TEST 2
  it("Should subscribe to Growth plan successfully", async function () {
    const price = await subscriptionManager.growthPrice();

    await subscriptionManager
      .connect(company)
      .subscribe(2, { value: price });

    const isSubscribed = await subscriptionManager.isSubscribed(
      company.address
    );

    expect(isSubscribed).to.equal(true);
  });

  // TEST 3
  it("Should subscribe to Scale plan successfully", async function () {
    const price = await subscriptionManager.scalePrice();

    await subscriptionManager
      .connect(company)
      .subscribe(3, { value: price });

    const isSubscribed = await subscriptionManager.isSubscribed(
      company.address
    );

    expect(isSubscribed).to.equal(true);
  });

  // TEST 4
  it("Should return false when not subscribed", async function () {
    const isSubscribed = await subscriptionManager.isSubscribed(
      company.address
    );

    expect(isSubscribed).to.equal(false);
  });

  // TEST 5
  it("Should fail with insufficient payment", async function () {
    await expect(
      subscriptionManager
        .connect(company)
        .subscribe(1, { value: ethers.parseEther("0.0001") })
    ).to.be.revertedWith("Insufficient payment");
  });

  // TEST 6
  it("Should return correct checks remaining", async function () {
    const price = await subscriptionManager.starterPrice();

    await subscriptionManager
      .connect(company)
      .subscribe(1, { value: price });

    const checksRemaining = await subscriptionManager.getChecksRemaining(
      company.address
    );

    expect(checksRemaining).to.equal(10000);
  });

  // TEST 7
  it("Should allow owner to withdraw fees", async function () {
    const price = await subscriptionManager.starterPrice();

    await subscriptionManager
      .connect(company)
      .subscribe(1, { value: price });

    await expect(
      subscriptionManager.connect(owner).withdrawFees()
    ).to.not.be.reverted;
  });

  // TEST 8
  it("Should allow owner to update prices", async function () {
    await subscriptionManager
      .connect(owner)
      .updatePrices(
        ethers.parseEther("0.002"),
        ethers.parseEther("0.006"),
        ethers.parseEther("0.016")
      );

    const newStarterPrice = await subscriptionManager.starterPrice();
    expect(newStarterPrice).to.equal(ethers.parseEther("0.002"));
  });
});