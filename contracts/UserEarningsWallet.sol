// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserEarningsWallet {

    address public owner;

    mapping(address => uint256) public earnings;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalWithdrawn;

    event EarningsCredited(
        address indexed user,
        uint256 amount,
        uint256 newBalance
    );

    event EarningsWithdrawn(
        address indexed user,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function creditEarnings(address user) external payable onlyOwner {
        require(msg.value > 0, "Amount must be greater than 0");

        earnings[user] += msg.value;
        totalEarned[user] += msg.value;

        emit EarningsCredited(user, msg.value, earnings[user]);
    }

    function withdraw() external {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        earnings[msg.sender] = 0;
        totalWithdrawn[msg.sender] += amount;

        payable(msg.sender).transfer(amount);

        emit EarningsWithdrawn(msg.sender, amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return earnings[user];
    }

    function getStats(address user) external view returns (
        uint256 currentBalance,
        uint256 allTimeEarned,
        uint256 allTimeWithdrawn
    ) {
        return (
            earnings[user],
            totalEarned[user],
            totalWithdrawn[user]
        );
    }

    function getTotalContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}