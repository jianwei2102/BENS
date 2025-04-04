// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./BusinessWalletFactory.sol";

interface IBusinessWallet {
    function withdrawETH(address to, uint256 amount) external;
    function withdrawERC20(address token, address to, uint256 amount) external;
}

contract EnhancedBusinessWalletResolver is ReentrancyGuard {
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
    function getWallet(
        bytes32 domainHash,
        address sender
    ) external returns (address) {
        Business storage business = businesses[domainHash];
        if (business.domainHash == bytes32(0)) {
            revert("Business not found");
        }

        // Check existing wallet with private mapping
        WalletInfo storage walletInfo = senderWallets[domainHash][sender];
        if (walletInfo.walletAddress != address(0) && walletInfo.isActive) {
            return walletInfo.walletAddress;
        }

        // Generate more private salt
        bytes32 salt = keccak256(
            abi.encodePacked(
                domainHash,
                sender,
                business.nonce++,
                DOMAIN_SALT  // Add contract-specific salt
            )
        );

        // Create wallet with obfuscated parameters
        address walletAddress = factory.createWallet(salt);
        
        // Private storage
        senderWallets[domainHash][sender] = WalletInfo({
            walletAddress: walletAddress,
            isActive: true,
            createdAt: block.timestamp
        });
        walletToDomain[walletAddress] = domainHash;

        // Emit minimal information
        emit WalletAssigned(domainHash);
        return walletAddress;
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