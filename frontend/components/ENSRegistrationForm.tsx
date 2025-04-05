"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { keccak256, namehash, defaultAbiCoder } from "ethers/lib/utils";
import ensControllerJson from "../abi/ensController.json";
import { convertToSeconds } from "../utils/convertToSeconds";
import businessWalletResolverABI from "../abi/BusinessWalletResolver.json";

export default function ENSRegistrationForm() {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ensureSepoliaNetwork = async (
    provider: ethers.providers.Web3Provider
  ) => {
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      // Sepolia chainId
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [
                  "https://sepolia.infura.io/v3/b403dd2687094ab3ae6f4e3858d2d7d9",
                ],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw error;
        }
      }
    }
  };

  const registerENS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Starting registration...");

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      await ensureSepoliaNetwork(provider);

      const signer = provider.getSigner();

      const network = await provider.getNetwork();
      console.log("Connected to network:", network);

      const ensController = new ethers.Contract(
        process.env.NEXT_PUBLIC_ENS_CONTROLLER_ADDRESS!,
        ensControllerJson.abi,
        signer
      );

      console.log("Checking availability for:", domain);
      // Check availability
      const available = await ensController.available(domain);
      console.log("Domain available:", available);

      if (!available) {
        setStatus("Domain not available");
        setIsLoading(false);
        return;
      }

      setStatus("Domain available, creating commitment...");

      const secret = keccak256(ethers.utils.randomBytes(32));
      const duration = convertToSeconds({ days: 45 });
      const owner = await signer.getAddress();

      // Make sure the resolver address is correct
      const resolverAddress = process.env.NEXT_PUBLIC_OFFCHAIN_RESOLVER_ADDRESS;
      console.log("Using resolver address:", resolverAddress);

      const commitmentParams = [
        domain,
        owner,
        duration,
        secret,
        resolverAddress,
        [], // Empty data array
        false, // No reverse record
        0, // No fuses
      ];

      const commitment = await ensController.makeCommitment(
        ...commitmentParams
      );
      setStatus("Submitting commitment...");

      const commitTx = await ensController.commit(commitment, {
        gasLimit: 50000,
      });
      await commitTx.wait();

      setStatus("Waiting for commitment to be ready (70 seconds)...");
      await new Promise((resolve) => setTimeout(resolve, 70000));

      const rentPrice = (await ensController.rentPrice(domain, duration))[0];
      setStatus(
        `Registering domain for ${ethers.utils.formatEther(rentPrice)} ETH...`
      );

      const tx = await ensController.register(...commitmentParams, {
        value: rentPrice,
        gasLimit: 300000,
      });

      await tx.wait(2); // Wait for 2 block confirmations
      console.log(
        "ENS registration confirmed, waiting for business registration..."
      );

      // // Add a small delay to allow ownership to propagate
      // await new Promise((resolve) => setTimeout(resolve, 5000));

      // // Verify ownership through NameWrapper
      // const nameWrapper = new ethers.Contract(
      //   "0x0635513f179D50A207757E05759CbD106d7dFcE8", // NameWrapper address
      //   [
      //     "function ownerOf(uint256 id) view returns (address)",
      //     "function getData(uint256 id) view returns (address, uint32, uint64)",
      //   ],
      //   provider
      // );

      // const node = namehash(`${domain}.eth`);
      // const tokenId = ethers.BigNumber.from(node).toString();
      // const [wrappedOwner] = await nameWrapper.getData(tokenId);
      // const currentSigner = await signer.getAddress();

      // if (wrappedOwner.toLowerCase() !== currentSigner.toLowerCase()) {
      //   throw new Error(
      //     `NameWrapper ownership verification failed. Owner: ${wrappedOwner}, Signer: ${currentSigner}`
      //   );
      // }

      // Now proceed with setting the name
      //   const nameSet = await setENSName(provider, domain);
      //   console.log("Name set result:", nameSet);

      //   if (!nameSet) {
      //     setStatus("Warning: Domain registered but name setting failed");
      //     setIsLoading(false);
      //     return;
      //   }

      // Then register the business
      const businessRegistered = await registerBusinessForDomain(
        provider,
        domain
      );
      console.log("Business registration result:", businessRegistered);

      if (!businessRegistered) {
        setStatus(
          "Warning: Domain registered but business registration failed"
        );
        setIsLoading(false);
        return;
      }

      // Test gateway connection
      const gatewayActive = await testGateway();
      console.log("Gateway active:", gatewayActive);

      setStatus(
        `✅ Domain "${domain}.eth" registered successfully!\n` +
          `Business registration: ${
            businessRegistered ? "Success" : "Failed"
          }\n` +
          `Gateway connection: ${gatewayActive ? "Active" : "Inactive"}`
      );

      // Log registration details for verification
      console.log("Registration details:", {
        domain: `${domain}.eth`,
        owner,
        resolver: resolverAddress,
        duration: duration.toString(),
        namehash: namehash(`${domain}.eth`),
        isVerified: true,
      });
    } catch (error: any) {
      console.error("Detailed error:", error);
      setStatus(`Error: ${error.message || "Unknown error occurred"}`);
      if (error.data) {
        console.error("Error data:", error.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRegistration = async (
    provider: ethers.providers.Web3Provider,
    domain: string,
    resolverAddress: string
  ) => {
    try {
      // Get the ENS Public Resolver ABI - you'll need to add this
      const ensRegistry = new ethers.Contract(
        "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", // ENS Registry address on Sepolia
        ["function resolver(bytes32 node) view returns (address)"],
        provider
      );

      const node = namehash(`${domain}.eth`);
      const currentResolver = await ensRegistry.resolver(node);

      console.log("Verification details:", {
        node,
        expectedResolver: resolverAddress,
        currentResolver,
        isMatch:
          currentResolver.toLowerCase() === resolverAddress.toLowerCase(),
      });

      return currentResolver.toLowerCase() === resolverAddress.toLowerCase();
    } catch (error) {
      console.error("Verification error:", error);
      return false;
    }
  };

  // Add this function to test resolution
  const testResolution = async (
    provider: ethers.providers.Web3Provider,
    domain: string
  ) => {
    try {
      console.log("Testing resolution for:", domain);

      // Get the resolver contract
      const resolverInterface = new ethers.utils.Interface([
        "function resolve(bytes calldata name, bytes calldata data) view returns (bytes)",
        "function addr(bytes32 node) view returns (address)",
      ]);

      const resolver = new ethers.Contract(
        process.env.NEXT_PUBLIC_OFFCHAIN_RESOLVER_ADDRESS!,
        resolverInterface,
        provider
      );

      const node = namehash(`${domain}.eth`);
      console.log("Resolution test details:", {
        domain: `${domain}.eth`,
        node,
        resolverAddress: process.env.NEXT_PUBLIC_OFFCHAIN_RESOLVER_ADDRESS,
      });

      // Encode the function call for addr(bytes32)
      const addrData = resolverInterface.encodeFunctionData("addr", [node]);

      // Encode the name as bytes
      const nameData = ethers.utils.toUtf8Bytes(`${domain}.eth`);

      console.log("Encoded data:", {
        nameData: nameData,
        addrData: addrData,
      });

      try {
        // Make the resolve call
        const result = await resolver.resolve(nameData, addrData, {
          gasLimit: 100000, // Add gas limit to ensure call goes through
        });
        console.log("Direct resolution result:", result);
      } catch (error: any) {
        console.log("CCIP-Read error details:", {
          error: error,
          errorData: error.data,
          errorArgs: error.errorArgs,
          errorName: error.errorName,
          errorSignature: error.errorSignature,
        });

        if (error.data) {
          // Parse the CCIP-read error data
          const errorData = defaultAbiCoder.decode(
            ["address", "string[]", "bytes", "bytes4", "bytes"],
            error.data
          );

          console.log("Decoded CCIP-Read data:", {
            sender: errorData[0],
            urls: errorData[1],
            callData: errorData[2],
            callbackFunction: errorData[3],
            extraData: errorData[4],
          });

          // Verify gateway URL
          if (errorData[1] && errorData[1][0]) {
            // Test gateway connection
            try {
              const response = await fetch(errorData[1][0], {
                method: "GET",
              });
              console.log("Gateway response status:", response.status);
            } catch (gatewayError) {
              console.error("Gateway connection error:", gatewayError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Resolution test error:", error);
    }
  };

  // Also add a simple gateway test function
  const testGateway = async () => {
    try {
      const response = await fetch("http://localhost:8080/gateway", {
        method: "GET",
      });
      console.log("Gateway test response:", response.status);
      return response.ok;
    } catch (error) {
      console.error("Gateway test error:", error);
      return false;
    }
  };

  const setENSName = async (
    provider: ethers.providers.Web3Provider,
    domain: string
  ) => {
    try {
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      // First get the ENS Registry contract
      const ensRegistry = new ethers.Contract(
        "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", // ENS Registry on Sepolia
        [
          "function setResolver(bytes32 node, address resolver) public",
          "function owner(bytes32 node) public view returns (address)",
          "function resolver(bytes32 node) public view returns (address)",
        ],
        signer
      );

      const node = namehash(`${domain}.eth`);

      // Check ownership first
      const currentOwner = await ensRegistry.owner(node);
      console.log("Domain ownership:", {
        domain: `${domain}.eth`,
        currentOwner,
        signerAddress,
        node,
      });

      if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("You don't own this domain");
      }

      // Get current resolver
      const currentResolver = await ensRegistry.resolver(node);
      const targetResolver = process.env.NEXT_PUBLIC_OFFCHAIN_RESOLVER_ADDRESS;

      console.log("Resolver status:", {
        currentResolver,
        targetResolver,
        needsUpdate:
          currentResolver.toLowerCase() !== targetResolver?.toLowerCase(),
      });

      // Only update resolver if needed
      if (currentResolver.toLowerCase() !== targetResolver?.toLowerCase()) {
        console.log("Setting resolver...");
        const tx = await ensRegistry.setResolver(node, targetResolver, {
          gasLimit: 100000, // Explicit gas limit
        });
        console.log("Waiting for resolver transaction...");
        await tx.wait();
        console.log("Resolver set successfully");
      } else {
        console.log("Resolver already set correctly");
      }

      // Now get the Public Resolver to set the name
      const publicResolver = new ethers.Contract(
        targetResolver!, // Your offchain resolver address
        [
          "function setName(bytes32 node, string memory name) public",
          "function name(bytes32 node) public view returns (string memory)",
        ],
        signer
      );

      // Set the name in the resolver
      try {
        const tx = await publicResolver.setName(node, `${domain}.eth`, {
          gasLimit: 100000, // Explicit gas limit
        });
        await tx.wait();
        console.log("Name set in resolver successfully");
      } catch (error) {
        console.error("Error setting name in resolver:", error);
        // Continue even if this fails, as it's not critical
      }

      return true;
    } catch (error) {
      console.error("Error setting ENS name:", {
        error,
        message: error.message,
        domain,
      });
      return false;
    }
  };

  const registerBusinessForDomain = async (
    provider: ethers.providers.Web3Provider,
    domain: string
  ) => {
    try {
      const businessWalletResolverAddress =
        process.env.NEXT_PUBLIC_BUSINESS_WALLETS_RESOLVER_ADDRESS;

      if (!businessWalletResolverAddress) {
        throw new Error("Business Wallet Resolver address not configured");
      }

      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const domainHash = ethers.utils.namehash(`${domain}.eth`);

      // Create dummy signature for now
      const signature = ethers.utils.arrayify("0x00");

      console.log("Registering business with parameters:", {
        resolverAddress: businessWalletResolverAddress,
        domain,
        domainHash,
        signerAddress,
      });

      const businessWalletResolver = new ethers.Contract(
        businessWalletResolverAddress,
        businessWalletResolverABI.abi,
        signer
      );

      // First register the business
      const registerTx = await businessWalletResolver.registerBusiness(
        domainHash,
        signature,
        {
          gasLimit: 200000,
        }
      );

      console.log("Business registration transaction sent:", registerTx.hash);
      await registerTx.wait();

      return true;
    } catch (error: any) {
      console.error("Error registering business:", {
        error,
        message: error.message,
        code: error.code,
        data: error.data,
      });
      return false;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Register ENS Domain</h2>
      <form onSubmit={registerENS} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Domain Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter domain name (without .eth)"
              disabled={isLoading}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
              .eth
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !domain}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Registering..." : "Register Domain"}
        </button>
      </form>
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-700">{status}</p>
        </div>
      )}
    </div>
  );
}
