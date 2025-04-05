// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./BusinessWalletFactory.sol";

interface IBusinessWallet {
    function withdrawETH(address to, uint256 amount) external;
    function withdrawERC20(address token, address to, uint256 amount) external;
}

contract BusinessWalletResolver is ReentrancyGuard {
    // State variables
    BusinessWalletFactory public immutable factory;
    bytes32 private immutable DOMAIN_SALT;
    
    struct Business {
        bytes32 domainHash;    // Hash of the ENS domain
        address owner;         // Business owner address (private)
        uint256 nonce;        // For generating deterministic wallet addresses
    }

    struct WalletInfo {
        address walletAddress;
        bool isActive;
        uint256 createdAt;
    }

    // Private mappings
    mapping(bytes32 => Business) private businesses;              
    mapping(bytes32 => mapping(address => WalletInfo)) private senderWallets; 
    mapping(address => bytes32) private walletToDomain;          // Wallet -> Domain mapping for withdrawals

    // Events - now with minimal information
    event BusinessRegistered(bytes32 indexed domainHash);
    event WalletAssigned(bytes32 indexed domainHash);
    event WalletRequested(
        bytes32 indexed domainHash,
        address indexed requestedSender,
        address indexed actualSender
    );

    constructor(address _factory) {
        factory = BusinessWalletFactory(_factory);
        DOMAIN_SALT = keccak256(abi.encodePacked(block.timestamp, msg.sender));
    }

    // Register a new business
    function registerBusiness(
        bytes32 domainHash,
        bytes memory signature
    ) external nonReentrant {
        require(verifyDomainOwnership(domainHash, signature), "Invalid domain ownership");
        
        businesses[domainHash] = Business({
            domainHash: domainHash,
            owner: msg.sender,
            nonce: 0
        });
        
        emit BusinessRegistered(domainHash);
    }

    // Modified wallet generation with additional privacy
    function getWallet(bytes32 domainHash, address sender) public view returns (address) {
        WalletInfo memory info = senderWallets[domainHash][sender];
        return info.isActive ? info.walletAddress : address(0);
    }

    function getOrCreateWallet(bytes32 domainHash, address sender) public returns (address) {
        address wallet = getWallet(domainHash, sender);
        if (wallet == address(0)) {
            wallet = createWallet(domainHash, sender);
        }
        return wallet;
    }

    function createWallet(bytes32 domainHash, address sender) public returns (address) {
        // Check if business exists
        require(businesses[domainHash].domainHash == domainHash, "Business not registered");
        
        // Check if wallet already exists
        WalletInfo memory info = senderWallets[domainHash][sender];
        require(!info.isActive, "Wallet already exists");

        // Create deterministic salt for the wallet
        bytes32 salt = keccak256(abi.encodePacked(domainHash, sender));
        
        // Deploy new wallet using factory
        address walletAddress = factory.createWallet(salt);
        
        // Store wallet info
        senderWallets[domainHash][sender] = WalletInfo({
            walletAddress: walletAddress,
            isActive: true,
            createdAt: block.timestamp
        });

        // Update wallet to domain mapping
        walletToDomain[walletAddress] = domainHash;

        emit WalletAssigned(domainHash);
        
        return walletAddress;
    }

    // Add a separate non-view function for logging if needed
    function logWalletRequest(bytes32 domainHash, address sender) public {
        emit WalletRequested(domainHash, sender, msg.sender);
    }

    // Withdraw funds - only business owner can call
    function withdrawFromWallet(
        address wallet,
        address token,
        uint256 amount
    ) external {
        bytes32 domainHash = walletToDomain[wallet];
        require(domainHash != bytes32(0), "Wallet not found");
        require(businesses[domainHash].owner == msg.sender, "Not owner");

        if (token == address(0)) {
            // Withdraw ETH
            IBusinessWallet(wallet).withdrawETH(msg.sender, amount);
        } else {
            // Withdraw ERC20
            IBusinessWallet(wallet).withdrawERC20(token, msg.sender, amount);
        }
    }

    // Private view function for business owner to check their wallets
    function _getBusinessWallets(
        bytes32 domainHash,
        address[] calldata senders
    ) private view returns (WalletInfo[] memory) {
        require(businesses[domainHash].owner == msg.sender, "Not owner");
        
        WalletInfo[] memory wallets = new WalletInfo[](senders.length);
        for (uint i = 0; i < senders.length; i++) {
            wallets[i] = senderWallets[domainHash][senders[i]];
        }
        
        return wallets;
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