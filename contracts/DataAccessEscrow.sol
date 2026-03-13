// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ConsentRegistry.sol";

contract DataAccessEscrow {

    ConsentRegistry public consentRegistry;
    address public owner;
    uint256 public platformFeePercent = 50;

    struct Deposit {
        address company;
        address user;
        uint256 amount;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Deposit) public deposits;
    uint256 public depositCount;
    mapping(address => uint256) public userEarnings;
    uint256 public platformEarnings;

    event FeeDeposited(
        uint256 indexed depositId,
        address indexed company,
        address indexed user,
        uint256 amount
    );

    event PaymentReleased(
        uint256 indexed depositId,
        address indexed user,
        uint256 userAmount,
        uint256 platformAmount
    );

    event PaymentRefunded(
        uint256 indexed depositId,
        address indexed company,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _consentRegistry) {
        consentRegistry = ConsentRegistry(_consentRegistry);
        owner = msg.sender;
    }

    function depositFee(address user) external payable {
        require(msg.value > 0, "Fee must be greater than 0");

        depositCount++;
        deposits[depositCount] = Deposit({
            company: msg.sender,
            user: user,
            amount: msg.value,
            released: false,
            refunded: false
        });

        emit FeeDeposited(depositCount, msg.sender, user, msg.value);
        _processPayment(depositCount);
    }

    function _processPayment(uint256 depositId) internal {
        Deposit storage d = deposits[depositId];

        bool hasConsent = consentRegistry.checkConsent(d.user, d.company);

        if (hasConsent) {
            uint256 platformAmount = (d.amount * platformFeePercent) / 100;
            uint256 userAmount = d.amount - platformAmount;

            userEarnings[d.user] += userAmount;
            platformEarnings += platformAmount;
            d.released = true;

            emit PaymentReleased(depositId, d.user, userAmount, platformAmount);
        } else {
            d.refunded = true;
            payable(d.company).transfer(d.amount);

            emit PaymentRefunded(depositId, d.company, d.amount);
        }
    }

    function withdrawEarnings() external {
        uint256 amount = userEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        userEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = platformEarnings;
        require(amount > 0, "No platform fees to withdraw");

        platformEarnings = 0;
        payable(owner).transfer(amount);
    }

    function getEarnings(address user) external view returns (uint256) {
        return userEarnings[user];
    }

    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 50, "Fee cannot exceed 50%");
        platformFeePercent = newFeePercent;
    }
}
