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
    mapping(bytes32 => address[]) private resolvedAddresses;  // domainHash => all resolved addresses
    mapping(bytes32 => mapping(address => uint256)) private lastInteraction; // domainHash => wallet => timestamp
    
    // Events
    event BusinessRegistered(bytes32 indexed domainHash);
    event WalletAssigned(bytes32 indexed domainHash, address indexed sender);
    event WalletGenerated(
        bytes32 indexed domainHash,
        address indexed sender,
        address generatedWallet,
        uint256 timestamp
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
    ) external returns (address) {
        if (businesses[domainHash].domainHash == bytes32(0)) {
            revert BusinessNotFound();
        }

        address generatedWallet = generateDeterministicWallet(domainHash, sender);
        
        // Track only new resolutions
        if (lastInteraction[domainHash][generatedWallet] == 0) {
            resolvedAddresses[domainHash].push(generatedWallet);
            emit WalletGenerated(domainHash, sender, generatedWallet, block.timestamp);
        }
        
        lastInteraction[domainHash][generatedWallet] = block.timestamp;
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

    // Function to get resolved addresses count (only owner)
    function getResolvedAddressesCount(bytes32 domainHash) external view returns (uint256) {
        require(businesses[domainHash].owner == msg.sender, "Not domain owner");
        return resolvedAddresses[domainHash].length;
    }

    // Function to get resolved addresses with pagination (only owner)
    function getResolvedAddresses(
        bytes32 domainHash,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory addresses,
        uint256[] memory timestamps
    ) {
        require(businesses[domainHash].owner == msg.sender, "Not domain owner");
        
        uint256 total = resolvedAddresses[domainHash].length;
        uint256 end = (offset + limit > total) ? total : offset + limit;
        uint256 resultSize = end - offset;
        
        addresses = new address[](resultSize);
        timestamps = new uint256[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            address resolvedAddr = resolvedAddresses[domainHash][offset + i];
            addresses[i] = resolvedAddr;
            timestamps[i] = lastInteraction[domainHash][resolvedAddr];
        }
    }
}