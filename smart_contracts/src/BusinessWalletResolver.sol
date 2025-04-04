// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EnhancedBusinessWalletResolver is ReentrancyGuard {
    // Structs
    struct Business {
        bytes32 domainHash;    // Hash of the ENS domain
        address owner;         // Business owner address (encrypted/committed)
        uint256 nonce;        // For generating deterministic wallet addresses
    }
    
    struct Transaction {
        address sender;
        uint256 timestamp;
        bytes32 walletSeed;   // Seed for generating consistent wallet addresses
    }

    // State variables
    mapping(bytes32 => Business) private businesses;              // domainHash => Business
    mapping(bytes32 => mapping(address => bytes32)) private senderWallets;  // domainHash => sender => walletSeed
    mapping(bytes32 => address) private defaultWallets;          // domainHash => default wallet
    
    // Events
    event BusinessRegistered(bytes32 indexed domainHash);
    event WalletAssigned(bytes32 indexed domainHash, address indexed sender);

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
        // Verify signature to prove domain ownership
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
    ) external view returns (address) {
        if (businesses[domainHash].domainHash == bytes32(0)) {
            revert BusinessNotFound();
        }

        bytes32 walletSeed = senderWallets[domainHash][sender];
        
        // If sender has no assigned wallet, generate deterministic one
        if (walletSeed == bytes32(0)) {
            return generateDeterministicWallet(domainHash, sender);
        }

        return address(uint160(uint256(walletSeed)));
    }

    // Internal function to generate deterministic wallet
    function generateDeterministicWallet(
        bytes32 domainHash,
        address sender
    ) internal pure returns (address) {
        bytes32 seed = keccak256(
            abi.encodePacked(
                domainHash,
                sender
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