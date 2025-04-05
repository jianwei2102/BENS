// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "forge-std/Script.sol";
import "../src/BusinessWalletFactory.sol";

contract DeployBusinessWalletFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the factory
        BusinessWalletFactory factory = new BusinessWalletFactory();

        vm.stopBroadcast();

        console.log("BusinessWalletFactory deployed to:", address(factory));
    }
} 