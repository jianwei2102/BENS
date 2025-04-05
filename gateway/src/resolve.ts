import { ethers } from "ethers";
import businessWalletsResolver from "./helpers/BusinessWalletResolver.json";
import "dotenv/config";

// Create provider and wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL!);

const BUSINESS_WALLETS_RESOLVER_ADDRESS =
  process.env.BUSINESS_WALLETS_RESOLVER_ADDRESS;

if (!BUSINESS_WALLETS_RESOLVER_ADDRESS) {
  throw new Error("BUSINESS_WALLETS_RESOLVER_ADDRESS is not defined");
}

const resolve = async (name: string, sender: string, data: any) => {
  try {
    // Create contract instance with provider for view functions
    const contract = new ethers.Contract(
      BUSINESS_WALLETS_RESOLVER_ADDRESS,
      businessWalletsResolver.abi,
      provider
    );

    // Calculate the domain hash from the name
    const domainHash = ethers.utils.namehash(name);

    try {
      // Get wallet address (view function only)
      const walletAddress = await contract.getWallet(domainHash, sender);
      console.log("walletAddress", walletAddress);

      // Encode the wallet address in the format ENS expects
      // For addr(bytes32) calls, we need to return the address as a 32-byte value
      return ethers.utils.defaultAbiCoder.encode(["address"], [walletAddress]);
    } catch (error: any) {
      console.log("Contract error:", error.message);
      // If business is not registered, return zero address
      if (error.message.includes("Business not registered")) {
        return ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [ethers.constants.AddressZero]
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error resolving address:", error);
    // For any other error, return zero address
    return ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [ethers.constants.AddressZero]
    );
  }
};

export default resolve;

// Notes on security
// 1. CCIP server is the msg.sender to contract, not the orginalSender. Hence we still sender in the getWallet params.
//    But this may mean that anyone can spam the contract to get destinationWallets.
//    => solution: Need to hash the addresses, or set gateway as authorised for this function
// 2. Anyone can observe the calls to contract and keep a record of all inputs and outputs
//    => solution: Need to hash the addresses
