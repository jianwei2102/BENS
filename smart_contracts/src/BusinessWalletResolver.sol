// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EnhancedBusinessWalletResolver is ReentrancyGuard {
    // Structs
    struct Business {
        bytes32 domainHash;    // Hash of the ENS domain
        address owner;         // Business owner address
        uint256 nonce;        // For generating deterministic wallet addresses
    }

    // State variables
    mapping(bytes32 => Business) private businesses;              // domainHash => Business
    mapping(bytes32 => address) private defaultWallets;          // domainHash => default wallet

    // Events
    event BusinessRegistered(bytes32 indexed domainHash);
    event WalletResolved(
        bytes32 indexed domainHash,
        bytes32 indexed senderHash  // Hash of sender address for privacy
    );

    // Errors
    error Unauthorized();
    error BusinessNotFound();
    error InvalidSignature();

    // Register a new business
    function registerBusiness(
        bytes32 domainHash,
        bytes memory signature,
        address defaultWallet
    ) external nonReentrant {
        require(verifyDomainOwnership(domainHash, signature), "Invalid domain ownership");
        
        businesses[domainHash] = Business({
            domainHash: domainHash,
            owner: msg.sender,
            nonce: 0
        });
        
        defaultWallets[domainHash] = defaultWallet;
        emit BusinessRegistered(domainHash);
    }

    // Get wallet address for a sender
    function getWallet(
        bytes32 domainHash,
        address sender
    ) external returns (address) {
        if (businesses[domainHash].domainHash == bytes32(0)) {
            revert BusinessNotFound();
        }

        address generatedWallet = generateDeterministicWallet(domainHash, sender);
        
        // Emit event with hashed sender address for privacy
        emit WalletResolved(domainHash, keccak256(abi.encodePacked(sender)));
        
        return generatedWallet;
    }

    // Internal function to generate deterministic wallet
    function generateDeterministicWallet(
        bytes32 domainHash,
        address sender
    ) internal pure returns (address) {
        bytes32 seed = keccak256(
            abi.encodePacked(
                domainHash,
                s   ender
            )
        );
        return address(uint160(uint256(seed)));
    }

    // Verify domain ownership (implement with ENS integration)
    function verifyDomainOwnership(
        bytes32 domainHash,
        bytes memory signature
    ) internal pure returns (bool) {
        // Implement ENS ownership verification
        return true; // Placeholder
    }
}