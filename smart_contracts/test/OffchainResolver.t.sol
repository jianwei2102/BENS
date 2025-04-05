// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "forge-std/Test.sol";
import "../src/OffChainResolver.sol";
import "../src/BusinessWalletResolver.sol";
import "../src/BusinessWalletFactory.sol";

contract OffchainResolverTest is Test {
    OffchainResolver public resolver;
    BusinessWalletFactory public factory;
    BusinessWalletResolver public businessResolver;
    address public signer;

    function setUp() public {
        // Deploy BusinessWalletFactory
        factory = new BusinessWalletFactory();
        
        // Deploy BusinessWalletResolver
        businessResolver = new BusinessWalletResolver(address(factory));

        // Create signers array for OffchainResolver
        address[] memory signers = new address[](1);
        signer = address(this);  // Use test contract as signer
        signers[0] = signer;

        // Deploy OffchainResolver
        resolver = new OffchainResolver(
            "http://localhost:8080/gateway",
            signers
        );
    }

    function testResolve() public {
        bytes memory name = bytes("test.eth");
        bytes32 node = bytes32(keccak256(name));
        
        // Encode test data
        bytes memory data = abi.encode(node, address(this));

        // Encode the resolution request
        bytes memory callData = abi.encodeWithSelector(
            IResolverService.resolve.selector,
            name,
            data
        );

        // Create URLs array
        string[] memory urls = new string[](1);
        urls[0] = "http://localhost:8080/gateway";

        // Expect the specific OffchainLookup error with actual parameters
        vm.expectRevert(
            abi.encodeWithSelector(
                OffchainResolver.OffchainLookup.selector,
                address(resolver),
                urls,
                callData,
                resolver.resolveWithProof.selector,
                callData  // extraData is same as callData in this case
            )
        );

        // Call resolve which should revert with OffchainLookup
        resolver.resolve(name, data);
    }

    function testGatewayUrl() public {
        assertEq(
            resolver.url(),
            "http://localhost:8080/gateway"
        );
    }

    function testSignerAccess() public {
        assertTrue(resolver.signers(signer));
    }
} 