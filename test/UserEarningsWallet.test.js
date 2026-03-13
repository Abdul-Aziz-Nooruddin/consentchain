const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserEarningsWallet", function () {
  let userEarningsWallet;
  let owner;
  let user;
  let user2;

  beforeEach(async function () {
    [owner, user, user2] = await ethers.getSigners();

    const UserEarningsWallet = await ethers.getContractFactory(
      "UserEarningsWallet"
    );
    userEarningsWallet = await UserEarningsWallet.deploy();
  });

  // TEST 1
  it("Should credit earnings to user successfully", async function () {
    const amount = ethers.parseEther("0.01");

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount });

    const balance = await userEarningsWallet.getBalance(user.address);
    expect(balance).to.equal(amount);
  });

  // TEST 2
  it("Should track total earned correctly", async function () {
    const amount = ethers.parseEther("0.01");

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount });

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount });

    const stats = await userEarningsWallet.getStats(user.address);
    expect(stats.allTimeEarned).to.equal(ethers.parseEther("0.02"));
  });

  // TEST 3
  it("Should allow user to withdraw earnings", async function () {
    const amount = ethers.parseEther("0.01");

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount });

    const balanceBefore = await ethers.provider.getBalance(user.address);

    await userEarningsWallet.connect(user).withdraw();

    const balanceAfter = await ethers.provider.getBalance(user.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  // TEST 4
  it("Should reset balance after withdrawal", async function () {
    const amount = ethers.parseEther("0.01");

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount });

    await userEarningsWallet.connect(user).withdraw();

    const balance = await userEarningsWallet.getBalance(user.address);
    expect(balance).to.equal(0);
  });

  // TEST 5
  it("Should fail withdrawal when no earnings", async function () {
    await expect(
      userEarningsWallet.connect(user).withdraw()
    ).to.be.revertedWith("No earnings to withdraw");
  });

  // TEST 6
  it("Should fail credit earnings from non owner", async function () {
    const amount = ethers.parseEther("0.01");

    await expect(
      userEarningsWallet
        .connect(user)
        .creditEarnings(user2.address, { value: amount })
    ).to.be.revertedWith("Not the owner");
  });

  // TEST 7
  it("Should track total withdrawn correctly", async function () {
    const amount = ethers.parseEther("0.01");

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount });

    await userEarningsWallet.connect(user).withdraw();

    const stats = await userEarningsWallet.getStats(user.address);
    expect(stats.allTimeWithdrawn).to.equal(amount);
  });

  // TEST 8
  it("Should handle multiple users independently", async function () {
    const amount1 = ethers.parseEther("0.01");
    const amount2 = ethers.parseEther("0.02");

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user.address, { value: amount1 });

    await userEarningsWallet
      .connect(owner)
      .creditEarnings(user2.address, { value: amount2 });

    const balance1 = await userEarningsWallet.getBalance(user.address);
    const balance2 = await userEarningsWallet.getBalance(user2.address);

    expect(balance1).to.equal(amount1);
    expect(balance2).to.equal(amount2);
  });
});