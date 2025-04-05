// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "forge-std/Script.sol";
import "../src/BusinessWalletResolver.sol";
import "../src/BusinessWalletFactory.sol";

contract DeployBusinessWalletResolver is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Get the factory address from env or deploy a new one
        address factoryAddress = vm.envOr("FACTORY_ADDRESS", address(0));
        
        if (factoryAddress == address(0)) {
            // Deploy new factory if address not provided
            BusinessWalletFactory factory = new BusinessWalletFactory();
            factoryAddress = address(factory);
            console.log("New BusinessWalletFactory deployed to:", factoryAddress);
        }

        // Deploy the resolver with the factory address
        BusinessWalletResolver resolver = new BusinessWalletResolver(factoryAddress);

        vm.stopBroadcast();

        console.log("BusinessWalletResolver deployed to:", address(resolver));
        console.log("Using factory at:", factoryAddress);
    }
} 