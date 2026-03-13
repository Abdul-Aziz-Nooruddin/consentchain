// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SubscriptionManager {

    address public owner;

    enum Plan { None, Starter, Growth, Scale }

    struct Subscription {
        Plan plan;
        uint256 startedAt;
        uint256 expiresAt;
        bool isActive;
    }

    mapping(address => Subscription) public subscriptions;

    uint256 public starterPrice = 0.001 ether;
    uint256 public growthPrice = 0.005 ether;
    uint256 public scalePrice = 0.015 ether;

    uint256 public starterChecks = 10000;
    uint256 public growthChecks = 100000;
    uint256 public scaleChecks = 1000000;

    mapping(address => uint256) public checksUsed;

    event Subscribed(
        address indexed company,
        Plan plan,
        uint256 expiresAt
    );

    event SubscriptionExpired(
        address indexed company
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function subscribe(Plan plan) external payable {
        require(plan != Plan.None, "Invalid plan");

        uint256 price = getPlanPrice(plan);
        require(msg.value >= price, "Insufficient payment");

        uint256 expiry = block.timestamp + 30 days;

        subscriptions[msg.sender] = Subscription({
            plan: plan,
            startedAt: block.timestamp,
            expiresAt: expiry,
            isActive: true
        });

        checksUsed[msg.sender] = 0;

        emit Subscribed(msg.sender, plan, expiry);
    }

    function isSubscribed(address company) external view returns (bool) {
        Subscription memory s = subscriptions[company];
        return (s.isActive && block.timestamp <= s.expiresAt);
    }

    function recordCheck(address company) external {
        require(
            subscriptions[company].isActive,
            "No active subscription"
        );
        checksUsed[company]++;
    }

    function getChecksRemaining(address company) external view returns (uint256) {
        Subscription memory s = subscriptions[company];
        uint256 limit = getPlanLimit(s.plan);
        uint256 used = checksUsed[company];
        if (used >= limit) return 0;
        return limit - used;
    }

    function getPlanPrice(Plan plan) public view returns (uint256) {
        if (plan == Plan.Starter) return starterPrice;
        if (plan == Plan.Growth) return growthPrice;
        if (plan == Plan.Scale) return scalePrice;
        return 0;
    }

    function getPlanLimit(Plan plan) public view returns (uint256) {
        if (plan == Plan.Starter) return starterChecks;
        if (plan == Plan.Growth) return growthChecks;
        if (plan == Plan.Scale) return scaleChecks;
        return 0;
    }

    function getSubscription(address company) external view returns (Subscription memory) {
        return subscriptions[company];
    }

    function updatePrices(
        uint256 _starter,
        uint256 _growth,
        uint256 _scale
    ) external onlyOwner {
        starterPrice = _starter;
        growthPrice = _growth;
        scalePrice = _scale;
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees to withdraw");
        payable(owner).transfer(amount);
    }
}

