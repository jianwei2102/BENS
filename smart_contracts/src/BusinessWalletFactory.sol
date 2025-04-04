// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BusinessWallet {
    address public immutable businessResolver;

    constructor() {
        businessResolver = msg.sender;
    }

    // Allow receiving ETH
    receive() external payable {}

    // Withdraw ETH - only callable by resolver
    function withdrawETH(address to, uint256 amount) external {
        require(msg.sender == businessResolver, "Not resolver");
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    // Withdraw ERC20 tokens - only callable by resolver
    function withdrawERC20(address token, address to, uint256 amount) external {
        require(msg.sender == businessResolver, "Not resolver");
        IERC20(token).transfer(to, amount);
    }
}

contract BusinessWalletFactory {
    event WalletCreated(address indexed wallet);

    function createWallet(bytes32 salt) external returns (address) {
        BusinessWallet wallet = new BusinessWallet{salt: salt}();
        emit WalletCreated(address(wallet));
        return address(wallet);
    }
} 