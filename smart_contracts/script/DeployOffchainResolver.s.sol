// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "forge-std/Script.sol";
import "../src/OffChainResolver.sol";

contract DeployOffchainResolver is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Create signers array with deployer address
        address[] memory signers = new address[](1);
        signers[0] = vm.addr(deployerPrivateKey);

        // Deploy with localhost gateway URL and deployer as signer
        OffchainResolver resolver = new OffchainResolver(
            "http://localhost:8080/gateway",
            signers
        );

        vm.stopBroadcast();

        console.log("OffchainResolver deployed to:", address(resolver));
        console.log("Initial signer:", signers[0]);
    }
} 