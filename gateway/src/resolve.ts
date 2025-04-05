import { ethers } from "ethers";
import businessWalletsResolver from "./helpers/BusinessWalletResolver.json";
import "dotenv/config";

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL!);

const BUSINESS_WALLETS_RESOLVER_ADDRESS =
  process.env.BUSINESS_WALLETS_RESOLVER_ADDRESS;

if (!BUSINESS_WALLETS_RESOLVER_ADDRESS) {
  throw new Error("BUSINESS_WALLETS_RESOLVER_ADDRESS is not defined");
}

const resolve = async (name: string, sender: string, data: any) => {
  try {
    // Create a contract instance
    const resolverContract = new ethers.Contract(
      BUSINESS_WALLETS_RESOLVER_ADDRESS,
      businessWalletsResolver.abi,
      provider
    );

    // Calculate the domain hash from the name
    const domainHash = ethers.utils.namehash(name);

    // Call the getWallet function with domainHash and sender address
    const walletAddress = await resolverContract.getWallet(domainHash, sender);

    // Return the wallet address as a hex string
    return ethers.utils.hexlify(walletAddress);
  } catch (error) {
    console.error("Error resolving address:", error);
    throw new Error("Failed to resolve address for sender");
  }
};

export default resolve;

// Notes on security
// 1. CCIP server is the msg.sender to contract, not the orginalSender. Hence we still sender in the getWallet params.
//    But this may mean that anyone can spam the contract to get destinationWallets.
//    => solution: Need to hash the addresses, or set gateway as authorised for this function
// 2. Anyone can observe the calls to contract and keep a record of all inputs and outputs
//    => solution: Need to hash the addresses
