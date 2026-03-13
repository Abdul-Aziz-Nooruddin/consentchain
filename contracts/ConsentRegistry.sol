// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsentRegistry {

    struct Consent {
        string dataType;
        string purpose;
        uint256 grantedAt;
        uint256 expiresAt;
        bool isActive;
    }

    mapping(address => mapping(address => Consent)) public consents;

    event ConsentGiven(
        address indexed user,
        address indexed company,
        string dataType,
        string purpose,
        uint256 expiresAt
    );

    event ConsentRevoked(
        address indexed user,
        address indexed company,
        uint256 revokedAt
    );

    function giveConsent(
        address company,
        string memory dataType,
        string memory purpose,
        uint256 durationInDays
    ) external {
        uint256 expiry = block.timestamp + (durationInDays * 1 days);
        consents[msg.sender][company] = Consent({
            dataType: dataType,
            purpose: purpose,
            grantedAt: block.timestamp,
            expiresAt: expiry,
            isActive: true
        });
        emit ConsentGiven(msg.sender, company, dataType, purpose, expiry);
    }

    function revokeConsent(address company) external {
        require(
            consents[msg.sender][company].isActive,
            "No active consent found"
        );
        consents[msg.sender][company].isActive = false;
        emit ConsentRevoked(msg.sender, company, block.timestamp);
    }

    function checkConsent(
        address user,
        address company
    ) external view returns (bool) {
        Consent memory c = consents[user][company];
        return (c.isActive && block.timestamp <= c.expiresAt);
    }

    function getConsent(
        address user,
        address company
    ) external view returns (Consent memory) {
        return consents[user][company];
    }

    function isExpired(
        address user,
        address company
    ) external view returns (bool) {
        return block.timestamp > consents[user][company].expiresAt;
    }
}